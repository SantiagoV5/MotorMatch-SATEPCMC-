const prisma = require('../../config/database');

function toNum(v) { return v === null || v === undefined ? null : Number(v); }

/**
 * Guarda una comparación. bikeIds debe tener 2 ó 3 elementos.
 *
 * @param {number}      userId
 * @param {number[]}    bikeIds       - 2 ó 3 IDs de motos
 */
async function saveComparison(userId, bikeIds) {
  const [id1, id2 = null, id3 = null] = bikeIds.map(Number);

  await prisma.$executeRaw`
    INSERT INTO comparisons
      (user_id, bike_id_1, bike_id_2, bike_id_3, comparison_date)
    VALUES
      (${userId}, ${id1}, ${id2}, ${id3}, NOW())
  `;
  return { saved: true };
}

/**
 * Devuelve las 20 comparaciones más recientes del usuario con datos de las motos.
 * Nota: comparisonType siempre es 'general' y winnerBikeId siempre es null
 * (estas funcionalidades requieren columnas que no existen en el schema actual).
 */
async function getComparisonHistory(userId) {
  const rows = await prisma.$queryRaw`
    SELECT
      c.id                                    AS "id",
      c.comparison_date                       AS "comparisonDate",
      -- Moto 1
      m1.id          AS "bike1Id",
      m1.brand       AS "bike1Brand",
      m1.model       AS "bike1Model",
      m1.image_url   AS "bike1Image",
      m1.engine_cc   AS "bike1Cc",
      -- Moto 2
      m2.id          AS "bike2Id",
      m2.brand       AS "bike2Brand",
      m2.model       AS "bike2Model",
      m2.image_url   AS "bike2Image",
      m2.engine_cc   AS "bike2Cc",
      -- Moto 3 (puede ser NULL)
      m3.id          AS "bike3Id",
      m3.brand       AS "bike3Brand",
      m3.model       AS "bike3Model",
      m3.image_url   AS "bike3Image",
      m3.engine_cc   AS "bike3Cc"
    FROM comparisons c
    JOIN  motorcycles m1 ON m1.id = c.bike_id_1
    JOIN  motorcycles m2 ON m2.id = c.bike_id_2
    LEFT JOIN motorcycles m3 ON m3.id = c.bike_id_3
    WHERE c.user_id = ${userId}
    ORDER BY c.comparison_date DESC
    LIMIT 20
  `;

  return rows.map(r => ({
    id:             toNum(r.id),
    comparisonDate: r.comparisonDate,
    comparisonType: 'general',
    winnerBikeId:   null,
    bikes: [
      { id: toNum(r.bike1Id), brand: r.bike1Brand, model: r.bike1Model, imageUrl: r.bike1Image, engineCc: toNum(r.bike1Cc) },
      { id: toNum(r.bike2Id), brand: r.bike2Brand, model: r.bike2Model, imageUrl: r.bike2Image, engineCc: toNum(r.bike2Cc) },
      ...(r.bike3Id ? [{ id: toNum(r.bike3Id), brand: r.bike3Brand, model: r.bike3Model, imageUrl: r.bike3Image, engineCc: toNum(r.bike3Cc) }] : []),
    ],
  }));
}

async function deleteComparison(userId, comparisonId) {
  const id = Number(comparisonId);
  const result = await prisma.$executeRaw`
    DELETE FROM comparisons WHERE id = ${id} AND user_id = ${userId}
  `;
  if (result === 0) {
    const err = new Error('Comparación no encontrada');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true };
}

async function deleteAllComparisons(userId) {
  await prisma.$executeRaw`DELETE FROM comparisons WHERE user_id = ${userId}`;
  return { deleted: true };
}

module.exports = { saveComparison, getComparisonHistory, deleteComparison, deleteAllComparisons };
