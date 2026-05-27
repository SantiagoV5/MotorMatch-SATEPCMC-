const prisma = require('../../config/database')
const { generateRecommendations } = require('../recommendations/recommendation.service')

const USAGE_TYPES = new Set(['ciudad', 'carretera', 'mixto', 'offroad', 'trabajo', 'deporte'])
const MOTORCYCLE_SKILLS = new Set(['automatica', 'semiautomatica', 'manual'])

function normalizeUsageTypes(data) {
  const rawValues = Array.isArray(data.usageTypes) ? data.usageTypes : []
  const legacyValue = typeof data.usageType === 'string' && data.usageType.trim() ? [data.usageType.trim()] : []

  return [...rawValues, ...legacyValue]
    .map(value => String(value).trim())
    .filter(value => USAGE_TYPES.has(value))
    .filter((value, index, array) => array.indexOf(value) === index)
}

function normalizeExperienceYears(value) {
  const numericValue = Number.parseInt(value, 10)
  return Number.isNaN(numericValue) ? null : numericValue
}

function normalizeMotorcycleSkill(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return MOTORCYCLE_SKILLS.has(normalized) ? normalized : null
}

/**
 * Procesa el cuestionario del usuario:
 * 1. Guarda el cuestionario en la BD
 * 2. Genera y guarda las recomendaciones
 * 3. Actualiza el cuestionario con los IDs de recomendaciones
 * 4. Devuelve { questionnaire, recommendations }
 */
async function processQuestionnaire(userId, data) {
  const budget = data.budget ? parseFloat(data.budget) : 0
  const usageTypes = normalizeUsageTypes(data)
  const primaryUsageType = usageTypes[0] || null
  const ridingExperienceYears = normalizeExperienceYears(data.ridingExperienceYears)
  const motorcycleTypeExperience = normalizeMotorcycleSkill(data.motorcycleTypeExperience)

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      heightCm: true,
      preferredBrands: true,
    },
  })

  const questionnaireData = {
    userId,
    budget,
    includesSoat:         data.includesSoat         ?? false,
    includesRegistration: data.includesRegistration  ?? false,
    usageType:            primaryUsageType           ?? '',
    usageTypes,
    frequency:            data.frequency             ?? null,
    motorcycleTypeExperience,
    ridingExperienceYears,
    heightCm:             data.heightCm,
    weightKg:             data.weightKg              ?? null,
    comfortWithHeavy:     data.comfortWithHeavy      ?? null,
    recommendationIds:    [],
  }

  // 1. Crear o actualizar cuestionario según si el usuario ya tenía uno
  const existing = await prisma.questionnaire.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  let questionnaire
  if (existing) {
    // Ya existe — actualizar en lugar de crear uno nuevo
    questionnaire = await prisma.questionnaire.update({
      where: { id: existing.id },
      data:  { ...questionnaireData, completedAt: new Date() },
    })
    // Borrar las recomendaciones anteriores vinculadas a este cuestionario
    await prisma.recommendation.deleteMany({
      where: { questionnaireId: existing.id },
    })
  } else {
    // Primera vez — crear registro nuevo
    questionnaire = await prisma.questionnaire.create({
      data: questionnaireData,
    })
  }

  // Actualizar budgetRange en el usuario
  const budgetRange = budget > 0 ? { min: 0, max: budget } : null
  await prisma.user.update({
    where: { id: userId },
    data: { budgetRange },
  })
  console.log(`✅ [Questionnaire] Presupuesto del usuario #${userId} actualizado: ${budgetRange ? `$0 - $${budget}` : 'Sin presupuesto'}`)

  // 2. Generar recomendaciones
  const recommendations = await generateRecommendations(userId, questionnaire.id, {
    budget,
    includesSoat:         data.includesSoat,
    includesRegistration: data.includesRegistration,
    usageType:            primaryUsageType,
    usageTypes,
    heightCm:             currentUser?.heightCm || data.heightCm,
    weightKg:             data.weightKg,
    comfortWithHeavy:     data.comfortWithHeavy,
    ridingExperienceYears,
    motorcycleTypeExperience,
    preferredBrands:      currentUser?.preferredBrands || [],
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
