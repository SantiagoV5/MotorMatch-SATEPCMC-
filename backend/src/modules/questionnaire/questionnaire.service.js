const prisma = require('../../config/database')
const { generateRecommendations } = require('../recommendations/recommendation.service')

/**
 * Procesa el cuestionario del usuario:
 * 1. Guarda el cuestionario en la BD
 * 2. Genera y guarda las recomendaciones
 * 3. Actualiza el cuestionario con los IDs de recomendaciones
 * 4. Devuelve { questionnaire, recommendations }
 */
async function processQuestionnaire(userId, data) {
  const budget = data.budget ? parseFloat(data.budget) : 0

  // 1. Guardar cuestionario
  const questionnaire = await prisma.questionnaire.create({
    data: {
      userId,
      budget,
      includesSoat:         data.includesSoat         ?? false,
      includesRegistration: data.includesRegistration  ?? false,
      usageType:            data.usageType             ?? '',
      frequency:            data.frequency             ?? null,
      hasPassenger:         data.hasPassenger          ?? false,
      passengerFrequency:   data.passengerFrequency    ?? null,
      heightCm:             data.heightCm,
      weightKg:             data.weightKg              ?? null,
      comfortWithHeavy:     data.comfortWithHeavy      ?? null,
      recommendationIds:    [],
    },
  })

  // 2. Generar recomendaciones
  const recommendations = await generateRecommendations(userId, questionnaire.id, {
    budget,
    includesSoat:         data.includesSoat,
    includesRegistration: data.includesRegistration,
    usageType:            data.usageType,
    heightCm:             data.heightCm,
    weightKg:             data.weightKg,
    comfortWithHeavy:     data.comfortWithHeavy,
  })

  // 3. Actualizar cuestionario con IDs de recomendaciones
  const recIds = recommendations.map(r => r.id)
  await prisma.questionnaire.update({
    where: { id: questionnaire.id },
    data:  { recommendationIds: recIds },
  })

  return { questionnaire, recommendations }
}

module.exports = { processQuestionnaire }
