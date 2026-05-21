const db = require('../../config/database');

const MAX_NEARBY_DISTANCE_KM = 120;
const DEFAULT_LIMIT = 20;
const INTERNAL_FETCH_LIMIT = 150;

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getDealerships(filters = {}) {
  const limit = normalizeLimit(filters.limit);
  const location = normalizeLocation(filters);
  const brand = typeof filters.brand === 'string' ? filters.brand.trim() : '';

  const candidates = brand
    ? await findDealershipsByBrand(brand)
    : await findActiveDealerships();

  return buildDealershipResult(candidates, {
    limit,
    location,
    source: brand ? 'brand' : 'all',
    brand: brand || null,
  });
}

async function getDealershipsByMotorcycle(motorcycleId, filters = {}) {
  const parsedMotorcycleId = Number.parseInt(motorcycleId, 10);
  if (!Number.isInteger(parsedMotorcycleId) || parsedMotorcycleId <= 0) {
    throw createError('ID de motocicleta invalido', 400);
  }

  const motorcycle = await db.motorcycle.findFirst({
    where: { id: parsedMotorcycleId, isActive: true },
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
    },
  });

  if (!motorcycle) {
    throw createError('Motocicleta no encontrada', 404);
  }

  const candidates = await findDealershipsByMotorcycle(parsedMotorcycleId);

  return buildDealershipResult(candidates, {
    limit: normalizeLimit(filters.limit),
    location: normalizeLocation(filters),
    source: 'motorcycle',
    motorcycle,
    brand: motorcycle.brand,
  });
}

async function findActiveDealerships() {
  return db.dealership.findMany({
    where: { isActive: true },
    take: INTERNAL_FETCH_LIMIT,
    orderBy: dealershipOrder,
    include: dealershipInclude,
  });
}

async function findDealershipsByBrand(brand) {
  return db.dealership.findMany({
    where: {
      isActive: true,
      brands: {
        some: {
          brand: { equals: brand, mode: 'insensitive' },
        },
      },
    },
    take: INTERNAL_FETCH_LIMIT,
    orderBy: dealershipOrder,
    include: dealershipInclude,
  });
}

async function findDealershipsByMotorcycle(motorcycleId) {
  return db.dealership.findMany({
    where: {
      isActive: true,
      motorcycles: {
        some: {
          motorcycleId,
          isAvailable: true,
        },
      },
    },
    take: INTERNAL_FETCH_LIMIT,
    orderBy: dealershipOrder,
    include: dealershipInclude,
  });
}

const dealershipOrder = [
  { isFeatured: 'desc' },
  { priority: 'asc' },
  { name: 'asc' },
];

const dealershipInclude = {
  brands: {
    select: { brand: true },
    orderBy: { brand: 'asc' },
  },
  motorcycles: {
    where: { isAvailable: true },
    select: {
      motorcycleId: true,
      notes: true,
    },
    orderBy: { motorcycleId: 'asc' },
  },
};

function buildDealershipResult(candidates, options) {
  const {
    limit = DEFAULT_LIMIT,
    location,
    source,
    motorcycle = null,
    brand = null,
  } = options;

  const serialized = candidates.map((dealership) => serializeDealership(dealership));

  if (serialized.length === 0) {
    return {
      items: [],
      meta: {
        source,
        brand,
        motorcycle,
        locationUsed: Boolean(location),
        maxDistanceKm: MAX_NEARBY_DISTANCE_KM,
        resultMode: 'empty',
        fallback: false,
      },
    };
  }

  if (location) {
    const withDistance = serialized
      .map((dealership) => ({
        ...dealership,
        distanceKm: calculateDistanceKm(
          location.lat,
          location.lng,
          dealership.latitude,
          dealership.longitude,
        ),
      }))
      .sort(compareByDistanceThenPriority);

    const nearby = withDistance.filter((dealership) => dealership.distanceKm <= MAX_NEARBY_DISTANCE_KM);

    if (nearby.length > 0) {
      return {
        items: nearby.slice(0, limit),
        meta: {
          source,
          brand,
          motorcycle,
          locationUsed: true,
          maxDistanceKm: MAX_NEARBY_DISTANCE_KM,
          resultMode: 'nearby',
          fallback: false,
        },
      };
    }

    const nationalFallback = pickNationalFallback(withDistance, limit);
    return {
      items: nationalFallback,
      meta: {
        source,
        brand,
        motorcycle,
        locationUsed: true,
        maxDistanceKm: MAX_NEARBY_DISTANCE_KM,
        resultMode: 'national_featured',
        fallback: true,
      },
    };
  }

  return {
    items: pickNationalFallback(serialized, limit),
    meta: {
      source,
      brand,
      motorcycle,
      locationUsed: false,
      maxDistanceKm: MAX_NEARBY_DISTANCE_KM,
      resultMode: 'national_featured',
      fallback: true,
    },
  };
}

function pickNationalFallback(dealerships, limit) {
  const featured = dealerships.filter((dealership) => dealership.isFeatured);
  const source = featured.length > 0 ? featured : dealerships;
  return [...source].sort(compareByPriority).slice(0, limit);
}

function serializeDealership(dealership) {
  const latitude = toNumber(dealership.latitude);
  const longitude = toNumber(dealership.longitude);
  const mapsUrl = dealership.mapsUrl || buildMapsUrl(latitude, longitude, dealership.name);
  const whatsappUrl = buildWhatsAppUrl(dealership.whatsapp);
  const phoneUrl = buildPhoneUrl(dealership.phone);

  return {
    id: dealership.id,
    name: dealership.name,
    address: dealership.address,
    city: dealership.city,
    department: dealership.department,
    latitude,
    longitude,
    phone: dealership.phone,
    whatsapp: dealership.whatsapp,
    website: dealership.website,
    mapsUrl,
    isOfficial: dealership.isOfficial,
    isFeatured: dealership.isFeatured,
    priority: dealership.priority,
    brands: dealership.brands.map((item) => item.brand),
    availableMotorcycleIds: dealership.motorcycles.map((item) => item.motorcycleId),
    motorcycleNotes: dealership.motorcycles
      .filter((item) => item.notes)
      .map((item) => ({ motorcycleId: item.motorcycleId, notes: item.notes })),
    contact: {
      phone: dealership.phone,
      phoneUrl,
      whatsapp: dealership.whatsapp,
      whatsappUrl,
      website: dealership.website,
      mapsUrl,
      isAvailable: Boolean(dealership.phone || dealership.whatsapp || dealership.website),
    },
  };
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, 1), 50);
}

function normalizeLocation(filters) {
  if (filters.lat === undefined || filters.lng === undefined) return null;

  const lat = Number(filters.lat);
  const lng = Number(filters.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value.toNumber === 'function') return value.toNumber();
  return Number(value);
}

function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLng = degreesToRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return Math.round((earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 10) / 10;
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function compareByDistanceThenPriority(a, b) {
  return (a.distanceKm - b.distanceKm) || compareByPriority(a, b);
}

function compareByPriority(a, b) {
  if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.name.localeCompare(b.name, 'es');
}

function buildMapsUrl(latitude, longitude, name) {
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name || 'Concesionario')}`;
}

function buildWhatsAppUrl(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return null;
  const normalized = digits.startsWith('57') ? digits : `57${digits}`;
  return `https://wa.me/${normalized}`;
}

function buildPhoneUrl(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9+]/g, '');
  return cleaned ? `tel:${cleaned}` : null;
}

module.exports = {
  MAX_NEARBY_DISTANCE_KM,
  getDealerships,
  getDealershipsByMotorcycle,
};
