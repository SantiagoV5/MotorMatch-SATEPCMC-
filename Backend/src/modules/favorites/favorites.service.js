const prisma = require('../../config/database');

// ─────────────────────────────────────────────────────────────────────────────
// favorites.service.js
//
// Usa $queryRaw / $executeRaw porque el cliente Prisma fue generado sin el
// modelo Favorite. IMPORTANTE: $queryRaw devuelve los tipos de PostgreSQL
// directamente — INTEGER → BigInt en Node.js, DECIMAL → string.
// Por eso todas las funciones convierten explícitamente los valores antes
// de devolverlos al controller.
// ─────────────────────────────────────────────────────────────────────────────

/** Convierte un valor BigInt o string numérico a number de JS */
function toNumber(val) {
  if (val === null || val === undefined) return null;
  return Number(val);
}

/**
 * Devuelve todos los favoritos de un usuario con datos completos de la moto.
 */
async function getFavoritesByUser(userId) {
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
      m.seat_height_cm AS "seatHeightCm",
      m.weight_kg      AS "weightKg",
      m.fuel_tank_liters AS "fuelTankLiters",
      m.consumption_kmpl AS "consumptionKmpl"
    FROM favorites f
    JOIN motorcycles m ON m.id = f.motorcycle_id
    WHERE f.user_id = ${userId}
      AND m.is_active = true
    ORDER BY f.created_at DESC
  `;

  return rows.map(row => ({
    favoriteId: toNumber(row.favoriteId),
    createdAt:  row.createdAt,
    id:         toNumber(row.id),
    brand:      row.brand,
    model:      row.model,
    year:       toNumber(row.year),
    engineCc:   toNumber(row.engineCc),
    powerHp:    toNumber(row.powerHp),       // Decimal → string → number
    price:      toNumber(row.price),         // Decimal → string → number
    currency:   row.currency,
    imageUrl:   row.imageUrl,
    description: row.description,
    seatHeightCm:    toNumber(row.seatHeightCm),
    weightKg:        toNumber(row.weightKg),
    fuelTankLiters:  toNumber(row.fuelTankLiters),
    consumptionKmpl: toNumber(row.consumptionKmpl),
    segment:         getSegment(toNumber(row.engineCc)),
    priceFormatted:  formatPrice(toNumber(row.price), row.currency),
  }));
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
    SELECT id FROM motorcycles
    WHERE id = ${motoId} AND is_active = true
    LIMIT 1
  `;

  if (!moto) {
    const err = new Error('Motocicleta no encontrada');
    err.statusCode = 404;
    throw err;
  }

  // INSERT ignorando duplicado (ON CONFLICT DO NOTHING)
  await prisma.$executeRaw`
    INSERT INTO favorites (user_id, motorcycle_id, created_at)
    VALUES (${userId}, ${motoId}, NOW())
    ON CONFLICT (user_id, motorcycle_id) DO NOTHING
  `;

  // Devolver el registro (nuevo o existente)
  const [favorite] = await prisma.$queryRaw`
    SELECT id, created_at AS "createdAt", motorcycle_id AS "motorcycleId"
    FROM favorites
    WHERE user_id = ${userId} AND motorcycle_id = ${motoId}
    LIMIT 1
  `;

  return {
    id:           toNumber(favorite.id),
    createdAt:    favorite.createdAt,
    motorcycleId: toNumber(favorite.motorcycleId),
  };
}

/**
 * Elimina un favorito del usuario.
 */
async function removeFavorite(userId, motorcycleId) {
  const motoId = parseInt(motorcycleId, 10);

  if (isNaN(motoId)) {
    const err = new Error('ID de motocicleta inválido');
    err.statusCode = 400;
    throw err;
  }

  const result = await prisma.$executeRaw`
    DELETE FROM favorites
    WHERE user_id = ${userId} AND motorcycle_id = ${motoId}
  `;

  if (result === 0) {
    const err = new Error('Favorito no encontrado');
    err.statusCode = 404;
    throw err;
  }

  return { deleted: true };
}

/**
 * Devuelve los IDs de motos favoritas del usuario como number[].
 * Convierte BigInt → number para que === y Set.has() funcionen correctamente
 * al comparar con los IDs que devuelve el cliente Prisma normal (number).
 */
async function getFavoriteIds(userId) {
  const rows = await prisma.$queryRaw`
    SELECT motorcycle_id AS "motorcycleId"
    FROM favorites
    WHERE user_id = ${userId}
  `;
  // toNumber() es CRÍTICO aquí: PostgreSQL devuelve INTEGER como BigInt en Node.js
  // Si no se convierte, Set.has(32) con BigInt(32) en el Set siempre da false
  return rows.map(r => toNumber(r.motorcycleId));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

module.exports = { getFavoritesByUser, addFavorite, removeFavorite, getFavoriteIds };
