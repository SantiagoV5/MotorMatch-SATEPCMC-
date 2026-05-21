const db = require('../../config/database');

const dealershipInclude = {
  brands: {
    select: { brand: true },
    orderBy: { brand: 'asc' },
  },
  motorcycles: {
    select: {
      motorcycleId: true,
      isAvailable: true,
      notes: true,
      motorcycle: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
        },
      },
    },
    orderBy: { motorcycleId: 'asc' },
  },
};

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function listDealerships(filters = {}) {
  const page = Number.parseInt(filters.page, 10) || 1;
  const limit = Number.parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const where = buildListWhere(filters);

  const [items, total] = await Promise.all([
    db.dealership.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { isActive: 'desc' },
        { isFeatured: 'desc' },
        { priority: 'asc' },
        { name: 'asc' },
      ],
      include: dealershipInclude,
    }),
    db.dealership.count({ where }),
  ]);

  return {
    items: items.map(serializeDealership),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getDealershipById(id) {
  const dealership = await db.dealership.findUnique({
    where: { id: parseDealershipId(id) },
    include: dealershipInclude,
  });

  if (!dealership) {
    throw createError('Concesionario no encontrado', 404);
  }

  return serializeDealership(dealership);
}

async function createDealership(payload) {
  const data = normalizeDealershipPayload(payload, { partial: false });

  const dealership = await db.$transaction(async (tx) => {
    const created = await tx.dealership.create({
      data: {
        ...data.scalar,
        brands: {
          createMany: {
            data: data.brands.map((brand) => ({ brand })),
            skipDuplicates: true,
          },
        },
        ...(data.motorcycles.length > 0
          ? {
              motorcycles: {
                createMany: {
                  data: data.motorcycles,
                  skipDuplicates: true,
                },
              },
            }
          : {}),
      },
      include: dealershipInclude,
    });

    return created;
  });

  return serializeDealership(dealership);
}

async function updateDealership(id, payload) {
  const dealershipId = parseDealershipId(id);
  await ensureDealershipExists(dealershipId);
  const data = normalizeDealershipPayload(payload, { partial: true });

  const dealership = await db.$transaction(async (tx) => {
    if (data.brands) {
      await tx.dealershipBrand.deleteMany({ where: { dealershipId } });
      if (data.brands.length > 0) {
        await tx.dealershipBrand.createMany({
          data: data.brands.map((brand) => ({ dealershipId, brand })),
          skipDuplicates: true,
        });
      }
    }

    if (data.motorcycles) {
      await tx.dealershipMotorcycle.deleteMany({ where: { dealershipId } });
      if (data.motorcycles.length > 0) {
        await tx.dealershipMotorcycle.createMany({
          data: data.motorcycles.map((item) => ({ dealershipId, ...item })),
          skipDuplicates: true,
        });
      }
    }

    return tx.dealership.update({
      where: { id: dealershipId },
      data: data.scalar,
      include: dealershipInclude,
    });
  });

  return serializeDealership(dealership);
}

async function deactivateDealership(id) {
  const dealershipId = parseDealershipId(id);
  await ensureDealershipExists(dealershipId);

  const dealership = await db.dealership.update({
    where: { id: dealershipId },
    data: { isActive: false },
    include: dealershipInclude,
  });

  return serializeDealership(dealership);
}

function buildListWhere(filters) {
  const where = {};

  if (filters.status !== 'all') {
    where.isActive = filters.status === 'inactive' ? false : true;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { address: { contains: filters.search, mode: 'insensitive' } },
      { city: { contains: filters.search, mode: 'insensitive' } },
      { department: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.brand) {
    where.brands = {
      some: {
        brand: { equals: filters.brand, mode: 'insensitive' },
      },
    };
  }

  return where;
}

function normalizeDealershipPayload(payload, { partial }) {
  const scalarKeys = [
    'name',
    'address',
    'city',
    'department',
    'latitude',
    'longitude',
    'phone',
    'whatsapp',
    'website',
    'mapsUrl',
    'isOfficial',
    'isFeatured',
    'priority',
    'isActive',
  ];

  const scalar = {};
  scalarKeys.forEach((key) => {
    if (payload[key] !== undefined) {
      scalar[key] = normalizeNullable(payload[key]);
    }
  });

  const result = { scalar };

  if (!partial || payload.brands !== undefined) {
    result.brands = normalizeBrands(payload.brands || []);
    if (result.brands.length === 0) {
      throw createError('Agrega al menos una marca al concesionario', 400);
    }
  }

  if (!partial || payload.motorcycles !== undefined) {
    result.motorcycles = normalizeMotorcycleLinks(payload.motorcycles || []);
  }

  return result;
}

function normalizeBrands(brands) {
  const seen = new Set();
  return brands
    .map((brand) => String(brand || '').trim())
    .filter(Boolean)
    .filter((brand) => {
      const key = brand.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeMotorcycleLinks(motorcycles) {
  const byId = new Map();

  motorcycles.forEach((item) => {
    const motorcycleId = Number.parseInt(item.motorcycleId, 10);
    if (!Number.isInteger(motorcycleId) || motorcycleId <= 0) return;

    byId.set(motorcycleId, {
      motorcycleId,
      isAvailable: item.isAvailable !== false,
      notes: item.notes ? String(item.notes).trim() : null,
    });
  });

  return Array.from(byId.values());
}

function normalizeNullable(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return value;
}

function parseDealershipId(id) {
  const dealershipId = Number.parseInt(id, 10);
  if (!Number.isInteger(dealershipId) || dealershipId <= 0) {
    throw createError('ID de concesionario invalido', 400);
  }
  return dealershipId;
}

async function ensureDealershipExists(id) {
  const exists = await db.dealership.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!exists) {
    throw createError('Concesionario no encontrado', 404);
  }
}

function serializeDealership(dealership) {
  return {
    id: dealership.id,
    name: dealership.name,
    address: dealership.address,
    city: dealership.city,
    department: dealership.department,
    latitude: toNumber(dealership.latitude),
    longitude: toNumber(dealership.longitude),
    phone: dealership.phone,
    whatsapp: dealership.whatsapp,
    website: dealership.website,
    mapsUrl: dealership.mapsUrl,
    isOfficial: dealership.isOfficial,
    isFeatured: dealership.isFeatured,
    priority: dealership.priority,
    isActive: dealership.isActive,
    brands: dealership.brands.map((item) => item.brand),
    motorcycles: dealership.motorcycles.map((item) => ({
      motorcycleId: item.motorcycleId,
      isAvailable: item.isAvailable,
      notes: item.notes,
      motorcycle: item.motorcycle,
    })),
    createdAt: dealership.createdAt,
    updatedAt: dealership.updatedAt,
  };
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value.toNumber === 'function') return value.toNumber();
  return Number(value);
}

module.exports = {
  listDealerships,
  getDealershipById,
  createDealership,
  updateDealership,
  deactivateDealership,
};
