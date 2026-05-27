const prisma = require('../../config/database');

/**
 * Obtiene todas las motocicletas activas
 * @param {Object} filters - Filtros opcionales (marca, precioMin, precioMax, cilindrajeMin, cilindrajeMax)
 * @returns {Promise<Array>} Lista de motocicletas
 */
async function getAllMotorcycles(filters = {}) {
  const { brand, minPrice, maxPrice, minCc, maxCc, search, limit = 100 } = filters;

  const where = {
    isActive: true,
  };

  if (brand) {
    where.brand = { equals: brand, mode: 'insensitive' };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (minCc || maxCc) {
    where.engineCc = {};
    if (minCc) where.engineCc.gte = parseInt(minCc, 10);
    if (maxCc) where.engineCc.lte = parseInt(maxCc, 10);
  }

  // Búsqueda por texto en marca, modelo y descripción (insensible a mayúsculas)
  if (search && search.trim()) {
    where.OR = [
      { brand:       { contains: search.trim(), mode: 'insensitive' } },
      { model:       { contains: search.trim(), mode: 'insensitive' } },
      { description: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const motorcycles = await prisma.motorcycle.findMany({
    where,
    take: parseInt(limit, 10),
    orderBy: [
      { brand: 'asc' },
      { engineCc: 'asc' },
    ],
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      engineCc: true,
      powerHp: true,
      price: true,
      currency: true,
      imageUrl: true,
      description: true,
      seatHeightCm: true,
      weightKg: true,
      fuelTankLiters: true,
      consumptionKmpl: true,
    },
  });

  // Agregar badge de segmento basado en cilindraje
  return motorcycles.map(moto => ({
    ...moto,
    segment: getSegment(moto.engineCc),
    priceFormatted: formatPrice(moto.price, moto.currency),
  }));
}

/**
 * Obtiene una motocicleta por ID
 * @param {number} id - ID de la motocicleta
 * @returns {Promise<Object>} Motocicleta con detalles completos
 */
async function getMotorcycleById(id) {
  const motorcycleId = parseInt(id, 10);
  const rows = await prisma.$queryRaw`
    SELECT *
    FROM "motorcycles"
    WHERE id = ${motorcycleId}
    LIMIT 1
  `;

  const motorcycle = rows?.[0] ? normalizeMotorcycleDetailRow(rows[0]) : null;

  if (!motorcycle) {
    const error = new Error('Motocicleta no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...motorcycle,
    segment: getSegment(motorcycle.engineCc),
    priceFormatted: formatPrice(motorcycle.price, motorcycle.currency),
  };
}

/**
 * Obtiene marcas únicas disponibles
 * @returns {Promise<Array>} Lista de marcas
 */
async function getBrands() {
  const brands = await prisma.motorcycle.findMany({
    where: { isActive: true },
    select: { brand: true },
    distinct: ['brand'],
    orderBy: { brand: 'asc' },
  });

  return brands.map(b => b.brand);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSegment(engineCc) {
  const cc = Number(engineCc);

  if (!Number.isFinite(cc) || cc <= 250) return 'Económica';
  if (cc <= 600) return 'Intermedia';
  return 'Premium';
}

function formatPrice(price, currency = 'COP') {
  if (!price) return 'Consultar';
  
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return formatted;
}

function normalizeMotorcycleDetailRow(row) {
  return {
    id: pickField(row, ['id']),
    brand: pickField(row, ['brand']),
    model: pickField(row, ['model']),
    year: pickField(row, ['year']),
    engineCc: pickField(row, ['engineCc', 'engine_cc']),
    engineType: pickField(row, ['engineType', 'engine_type']),
    powerHp: pickField(row, ['powerHp', 'power_hp']),
    torqueNm: pickField(row, ['torqueNm', 'torque_nm']),
    weightKg: pickField(row, ['weightKg', 'weight_kg']),
    seatHeightCm: pickField(row, ['seatHeightCm', 'seat_height_cm']),
    fuelType: pickField(row, ['fuelType', 'fuel_type']),
    fuelTankLiters: pickField(row, ['fuelTankLiters', 'fuel_tank_liters']),
    consumptionKmpl: pickField(row, ['consumptionKmpl', 'consumption_kmpl']),
    transmission: pickField(row, ['transmission']),
    frontBrakeSystem: pickField(row, ['frontBrakeSystem', 'front_brake_system']),
    price: pickField(row, ['price']),
    currency: pickField(row, ['currency']),
    imageUrl: pickField(row, ['imageUrl', 'image_url']),
    galleryImages: pickField(row, ['galleryImages', 'gallery_images']) || [],
    description: pickField(row, ['description']),
    advantages: pickField(row, ['advantages']) || [],
    disadvantages: pickField(row, ['disadvantages']) || [],
    referencesYT: pickField(row, ['referencesYT', 'references_yt', 'referencesyt']) || null,
    colors: pickField(row, ['colors']) || [],
    countryOrigin: pickField(row, ['countryOrigin', 'country_origin']),
    warranty: pickField(row, ['warranty']),
    isActive: pickField(row, ['isActive', 'is_active']),
    createdAt: pickField(row, ['createdAt', 'created_at']),
    updatedAt: pickField(row, ['updatedAt', 'updated_at']),
  };
}

function pickField(row, candidateKeys) {
  for (const key of candidateKeys) {
    if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== undefined) {
      return row[key];
    }
  }

  return undefined;
}

module.exports = {
  getAllMotorcycles,
  getMotorcycleById,
  getBrands,
};
