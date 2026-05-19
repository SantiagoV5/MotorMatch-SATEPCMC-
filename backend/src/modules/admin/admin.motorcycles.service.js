const { Prisma } = require('@prisma/client');
const prisma = require('../../config/database');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeListItem(motorcycle) {
  if (!motorcycle) return null;

  return {
    id: motorcycle.id,
    brand: motorcycle.brand,
    model: motorcycle.model,
    year: motorcycle.year,
    engineCc: motorcycle.engineCc,
    price: motorcycle.price,
    currency: motorcycle.currency,
    imageUrl: motorcycle.imageUrl,
    description: motorcycle.description,
    isActive: motorcycle.isActive,
    source: motorcycle.source,
    createdAt: motorcycle.createdAt,
    updatedAt: motorcycle.updatedAt,
  };
}

function normalizeDetail(motorcycle) {
  if (!motorcycle) return null;

  return {
    id: motorcycle.id,
    brand: motorcycle.brand,
    model: motorcycle.model,
    year: motorcycle.year,
    engineCc: motorcycle.engineCc,
    engineType: motorcycle.engineType,
    powerHp: motorcycle.powerHp,
    torqueNm: motorcycle.torqueNm,
    weightKg: motorcycle.weightKg,
    seatHeightCm: motorcycle.seatHeightCm,
    fuelType: motorcycle.fuelType,
    fuelTankLiters: motorcycle.fuelTankLiters,
    consumptionKmpl: motorcycle.consumptionKmpl,
    transmission: motorcycle.transmission,
    brakeSystem: motorcycle.brakeSystem,
    price: motorcycle.price,
    currency: motorcycle.currency,
    soatEstimated: motorcycle.soatEstimated,
    registrationEstimated: motorcycle.registrationEstimated,
    imageUrl: motorcycle.imageUrl,
    galleryImages: motorcycle.galleryImages || [],
    referencesYT: motorcycle.referencesYT || null,
    description: motorcycle.description,
    advantages: motorcycle.advantages || [],
    disadvantages: motorcycle.disadvantages || [],
    source: motorcycle.source,
    externalIds: motorcycle.externalIds || null,
    lastApiUpdate: motorcycle.lastApiUpdate,
    isActive: motorcycle.isActive,
    createdAt: motorcycle.createdAt,
    updatedAt: motorcycle.updatedAt,
    colors: motorcycle.colors || [],
    countryOrigin: motorcycle.countryOrigin,
    warranty: motorcycle.warranty,
  };
}

function toDecimal(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw createError(`Valor inválido para ${fieldName}`, 400);
  }
  return new Prisma.Decimal(parsed);
}

function toInteger(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    throw createError(`Valor inválido para ${fieldName}`, 400);
  }
  return parsed;
}

function toStringArray(value, fieldName) {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  throw createError(`Formato inválido para ${fieldName}`, 400);
}

function toJsonValue(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      throw createError(`JSON inválido para ${fieldName}`, 400);
    }
  }
  return value;
}

function buildMotorcycleData(input) {
  return {
    brand: String(input.brand).trim(),
    model: String(input.model).trim(),
    year: toInteger(input.year, 'year'),
    engineCc: toInteger(input.engineCc, 'engineCc'),
    engineType: input.engineType ? String(input.engineType).trim() : null,
    powerHp: toDecimal(input.powerHp, 'powerHp'),
    torqueNm: toDecimal(input.torqueNm, 'torqueNm'),
    weightKg: toDecimal(input.weightKg, 'weightKg'),
    seatHeightCm: toInteger(input.seatHeightCm, 'seatHeightCm'),
    fuelType: input.fuelType ? String(input.fuelType).trim() : null,
    fuelTankLiters: toDecimal(input.fuelTankLiters, 'fuelTankLiters'),
    consumptionKmpl: toDecimal(input.consumptionKmpl, 'consumptionKmpl'),
    transmission: input.transmission ? String(input.transmission).trim() : null,
    brakeSystem: input.brakeSystem ? String(input.brakeSystem).trim() : null,
    price: toDecimal(input.price, 'price'),
    currency: input.currency ? String(input.currency).trim() : 'COP',
    soatEstimated: toDecimal(input.soatEstimated, 'soatEstimated'),
    registrationEstimated: toDecimal(input.registrationEstimated, 'registrationEstimated'),
    imageUrl: input.imageUrl ? String(input.imageUrl).trim() : null,
    galleryImages: toStringArray(input.galleryImages, 'galleryImages'),
    referencesYT: toJsonValue(input.referencesYT, 'referencesYT'),
    description: input.description ? String(input.description).trim() : null,
    advantages: toStringArray(input.advantages, 'advantages'),
    disadvantages: toStringArray(input.disadvantages, 'disadvantages'),
    source: input.source ? String(input.source).trim() : null,
    externalIds: toJsonValue(input.externalIds, 'externalIds'),
    lastApiUpdate: input.lastApiUpdate ? new Date(input.lastApiUpdate) : null,
    isActive: input.isActive === undefined ? true : Boolean(input.isActive),
    colors: toStringArray(input.colors, 'colors'),
    countryOrigin: input.countryOrigin ? String(input.countryOrigin).trim() : null,
    warranty: input.warranty ? String(input.warranty).trim() : null,
  };
}

async function listMotorcycles() {
  const motorcycles = await prisma.motorcycle.findMany({
    orderBy: [
      { brand: 'asc' },
      { model: 'asc' },
      { id: 'asc' },
    ],
  });

  return motorcycles.map(normalizeDetail);
}

async function getMotorcycleById(id) {
  const motorcycleId = Number.parseInt(id, 10);
  if (!Number.isFinite(motorcycleId)) {
    throw createError('ID de motocicleta inválido', 400);
  }

  const motorcycle = await prisma.motorcycle.findUnique({ where: { id: motorcycleId } });
  if (!motorcycle) {
    throw createError('Motocicleta no encontrada', 404);
  }

  return normalizeDetail(motorcycle);
}

async function createMotorcycle(input) {
  const data = buildMotorcycleData(input);
  const motorcycle = await prisma.motorcycle.create({ data });
  return normalizeDetail(motorcycle);
}

async function updateMotorcycle(id, input) {
  const motorcycleId = Number.parseInt(id, 10);
  if (!Number.isFinite(motorcycleId)) {
    throw createError('ID de motocicleta inválido', 400);
  }

  await getMotorcycleById(motorcycleId);
  const data = buildMotorcycleData(input);
  const motorcycle = await prisma.motorcycle.update({
    where: { id: motorcycleId },
    data,
  });

  return normalizeDetail(motorcycle);
}

async function toggleMotorcycleStatus(id) {
  const motorcycleId = Number.parseInt(id, 10);
  if (!Number.isFinite(motorcycleId)) {
    throw createError('ID de motocicleta inválido', 400);
  }

  const current = await getMotorcycleById(motorcycleId);
  const motorcycle = await prisma.motorcycle.update({
    where: { id: motorcycleId },
    data: { isActive: !current.isActive },
  });

  return normalizeDetail(motorcycle);
}

async function deleteMotorcycle(id) {
  const motorcycleId = Number.parseInt(id, 10);
  if (!Number.isFinite(motorcycleId)) {
    throw createError('ID de motocicleta inválido', 400);
  }

  await getMotorcycleById(motorcycleId);
  await prisma.motorcycle.delete({ where: { id: motorcycleId } });
  return { message: 'Motocicleta eliminada correctamente' };
}

module.exports = {
  listMotorcycles,
  getMotorcycleById,
  createMotorcycle,
  updateMotorcycle,
  toggleMotorcycleStatus,
  deleteMotorcycle,
  normalizeListItem,
  normalizeDetail,
};