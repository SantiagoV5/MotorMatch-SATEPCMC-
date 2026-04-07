const prisma = require('../../config/database');

// Usa $executeRaw para no depender del cliente Prisma generado.
async function saveComparison(userId, bikeIds) {
  const [id1, id2 = null, id3 = null] = bikeIds.map(Number);

  await prisma.$executeRaw`
    INSERT INTO comparisons (user_id, bike_id_1, bike_id_2, bike_id_3, comparison_date)
    VALUES (${userId}, ${id1}, ${id2}, ${id3}, NOW())
  `;

  return { saved: true };
}

module.exports = { saveComparison };
