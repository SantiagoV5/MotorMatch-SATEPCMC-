const prisma = require('../../config/database')
const { rankMotorcycles } = require('./recommendation.algorithm')

/**
 * Guarda las recomendaciones en la BD y devuelve los datos completos.
 * @param {number}  userId          - ID del usuario autenticado
 * @param {number}  questionnaireId - ID del cuestionario recién creado
 * @param {Array}   ranked          - Array de { motorcycle, compatibilityScore, reasons, warnings }
 * @returns {Array} Top 10 recomendaciones con datos de la moto
 */
async function saveRecommendations(userId, questionnaireId, ranked) {
  const top10 = ranked.slice(0, 10)

  const created = await Promise.all(
    top10.map(r =>
      prisma.recommendation.create({
        data: {
          userId,
          questionnaireId,
          motorcycleId:       r.motorcycle.id,
          compatibilityScore: r.compatibilityScore,
          reasons:            r.reasons,
          warnings:           r.warnings,
        },
        select: {
          id: true,
          compatibilityScore: true,
          reasons: true,
          warnings: true,
          motorcycle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              engineCc: true,
              price: true,
              imageUrl: true,
              seatHeightCm: true,
              weightKg: true,
              consumptionKmpl: true,
              soatEstimated: true,
              registrationEstimated: true,
            },
          },
        },
      })
    )
  )

  return created.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
}

/**
 * Obtiene todas las motos activas, corre el algoritmo y guarda los resultados.
 */
async function generateRecommendations(userId, questionnaireId, userProfile) {
  const motorcycles = await prisma.motorcycle.findMany({
    where: { isActive: true },
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      engineCc: true,
      price: true,
      imageUrl: true,
      seatHeightCm: true,
      weightKg: true,
      consumptionKmpl: true,
      soatEstimated: true,
      registrationEstimated: true,
    },
  })

  const ranked = rankMotorcycles(motorcycles, userProfile)
  const recommendations = await saveRecommendations(userId, questionnaireId, ranked)
  return recommendations
}

module.exports = { generateRecommendations }
