const prisma = require('../../config/database');

// ─────────────────────────────────────────────────────────────────────────────
// favorites.service.js
//
// Usa $queryRaw / $executeRaw en lugar del cliente Prisma generado.
// Esto permite que la tabla `favorites` funcione aunque el cliente fue
// generado antes de añadir el modelo (volumen Docker anónimo congela node_modules).
// IMPORTANTE: $queryRaw devuelve INTEGER como BigInt en Node.js → toNumber().
// ─────────────────────────────────────────────────────────────────────────────

function toNumber(val) {
  if (val === null || val === undefined) return null;
  return Number(val);
}

function getSegment(engineCc) {
  if (!engineCc) return 'Estándar';
  if (engineCc <= 150) return 'Económica';
  if (engineCc <= 300) return 'Intermedia';
  return 'Premium';
}

function formatPrice(price, currency = 'COP') {
  if (!price) return 'Consultar';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Obtiene todos los favoritos del usuario con datos completos de cada moto.
 */
async function getMyFavorites(userId) {
  const rows = await prisma.$queryRaw`
    SELECT
      f.id            AS "favoriteId",
      f.created_at    AS "createdAt",
      m.id,
      m.brand,
      m.model,
      m.year,
      m.engine_cc     AS "engineCc",
      m.power_hp      AS "powerHp",
      m.price,
      m.currency,
      m.image_url     AS "imageUrl",
      m.description,
      m.seat_height_cm  AS "seatHeightCm",
      m.weight_kg       AS "weightKg",
      m.fuel_tank_liters AS "fuelTankLiters",
      m.consumption_kmpl AS "consumptionKmpl"
    FROM favorites f
    JOIN motorcycles m ON m.id = f.motorcycle_id
    WHERE f.user_id = ${userId}
      AND m.is_active = true
    ORDER BY f.created_at DESC
  `;

  return rows.map(row => ({
    favoriteId:      toNumber(row.favoriteId),
    createdAt:       row.createdAt,
    id:              toNumber(row.id),
    brand:           row.brand,
    model:           row.model,
    year:            toNumber(row.year),
    engineCc:        toNumber(row.engineCc),
    powerHp:         toNumber(row.powerHp),
    price:           toNumber(row.price),
    currency:        row.currency,
    imageUrl:        row.imageUrl,
    description:     row.description,
    seatHeightCm:    toNumber(row.seatHeightCm),
    weightKg:        toNumber(row.weightKg),
    fuelTankLiters:  toNumber(row.fuelTankLiters),
    consumptionKmpl: toNumber(row.consumptionKmpl),
    segment:         getSegment(toNumber(row.engineCc)),
    priceFormatted:  formatPrice(toNumber(row.price), row.currency),
    addedToFavoritesAt: row.createdAt,
  }));
}

/**
 * Devuelve solo los IDs de motos favoritas como number[] (no BigInt).
 */
async function getMyFavoriteIds(userId) {
  const rows = await prisma.$queryRaw`
    SELECT motorcycle_id AS "motorcycleId"
    FROM favorites
    WHERE user_id = ${userId}
  `;
  return rows.map(r => toNumber(r.motorcycleId));
}

/**
 * Añade una moto a favoritos. Idempotente: no falla si ya existe.
 */
async function addFavorite(userId, motorcycleId) {
  const motoId = parseInt(motorcycleId, 10);

  if (isNaN(motoId)) {
    const err = new Error('ID de motocicleta inválido');
    err.statusCode = 400;
    throw err;
  }

  // Verificar que la moto existe y está activa
  const [moto] = await prisma.$queryRaw`
    SELECT id FROM motorcycles WHERE id = ${motoId} AND is_active = true LIMIT 1
  `;
  if (!moto) {
    const err = new Error('La moto especificada no existe');
    err.statusCode = 404;
    throw err;
  }

  // INSERT ignorando duplicado
  await prisma.$executeRaw`
    INSERT INTO favorites (user_id, motorcycle_id, created_at)
    VALUES (${userId}, ${motoId}, NOW())
    ON CONFLICT (user_id, motorcycle_id) DO NOTHING
  `;

  const [fav] = await prisma.$queryRaw`
    SELECT id, created_at AS "createdAt", motorcycle_id AS "motorcycleId"
    FROM favorites
    WHERE user_id = ${userId} AND motorcycle_id = ${motoId}
    LIMIT 1
  `;

  return {
    id:              toNumber(fav.id),
    createdAt:       fav.createdAt,
    motorcycleId:    toNumber(fav.motorcycleId),
  };
}

/**
 * Elimina una moto de favoritos.
 */
async function removeFavorite(userId, motorcycleId) {
  const motoId = parseInt(motorcycleId, 10);

  if (isNaN(motoId)) {
    const err = new Error('ID de motocicleta inválido');
    err.statusCode = 400;
    throw err;
  }

  const result = await prisma.$executeRaw`
    DELETE FROM favorites WHERE user_id = ${userId} AND motorcycle_id = ${motoId}
  `;

  if (result === 0) {
    const err = new Error('Esta moto no está en tus favoritos');
    err.statusCode = 404;
    throw err;
  }

  return { message: 'Moto eliminada de favoritos' };
}

/**
 * Verifica si una moto está en favoritos del usuario.
 */
async function isFavorite(userId, motorcycleId) {
  const motoId = parseInt(motorcycleId, 10);
  const rows = await prisma.$queryRaw`
    SELECT id FROM favorites WHERE user_id = ${userId} AND motorcycle_id = ${motoId} LIMIT 1
  `;
  return rows.length > 0;
}

module.exports = { getMyFavorites, getMyFavoriteIds, addFavorite, removeFavorite, isFavorite };
