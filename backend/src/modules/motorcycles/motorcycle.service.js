const prisma = require('../../config/database');

/**
 * Obtiene todas las motocicletas activas
 * @param {Object} filters - Filtros opcionales (marca, precioMin, precioMax, cilindrajeMin, cilindrajeMax)
 * @returns {Promise<Array>} Lista de motocicletas
 */
async function getAllMotorcycles(filters = {}) {
  const { brand, minPrice, maxPrice, minCc, maxCc, limit = 100 } = filters;

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
  const motorcycle = await prisma.motorcycle.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      recommendations: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

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
  if (engineCc <= 150) return 'Económica';
  if (engineCc <= 300) return 'Intermedia';
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

module.exports = {
  getAllMotorcycles,
  getMotorcycleById,
  getBrands,
};
