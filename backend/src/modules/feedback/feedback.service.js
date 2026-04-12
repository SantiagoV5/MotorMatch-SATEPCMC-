const prisma = require('../../config/database')

function buildSignature(recommendationIds = []) {
  return Array.isArray(recommendationIds) && recommendationIds.length > 0
    ? recommendationIds.map(Number).filter(Number.isFinite).join(',')
    : ''
}

async function resolveQuestionnaire(userId, questionnaireId) {
  const questionnaire = await prisma.questionnaire.findFirst({
    where: { id: questionnaireId, userId },
    select: {
      id: true,
      recommendationIds: true,
      createdAt: true,
    },
  })

  if (!questionnaire) {
    const error = new Error('Cuestionario no encontrado')
    error.statusCode = 404
    throw error
  }

  return questionnaire
}

async function getMyFeedback(userId, questionnaireId) {
  const questionnaire = await resolveQuestionnaire(userId, questionnaireId)
  const signature = buildSignature(questionnaire.recommendationIds)

  if (!signature) return null

  return prisma.feedback.findUnique({
    where: {
      unique_feedback_per_generation: {
        userId,
        questionnaireId: questionnaire.id,
        recommendationSignature: signature,
      },
    },
  })
}

async function createFeedback(userId, payload) {
  const questionnaire = await resolveQuestionnaire(userId, payload.questionnaireId)
  const signature = buildSignature(questionnaire.recommendationIds)

  if (!signature) {
    const error = new Error('No hay recomendaciones para calificar')
    error.statusCode = 400
    throw error
  }

  const existing = await prisma.feedback.findUnique({
    where: {
      unique_feedback_per_generation: {
        userId,
        questionnaireId: questionnaire.id,
        recommendationSignature: signature,
      },
    },
  })

  if (existing) {
    const error = new Error('Ya calificaste estas recomendaciones')
    error.statusCode = 409
    throw error
  }

  return prisma.feedback.create({
    data: {
      userId,
      questionnaireId: questionnaire.id,
      recommendationSignature: signature,
      isUseful: payload.isUseful,
      improvement: payload.improvement?.trim() || null,
    },
  })
}

async function getFeedbackStats() {
  const [total, useful, notUseful] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedback.count({ where: { isUseful: true } }),
    prisma.feedback.count({ where: { isUseful: false } }),
  ])

  return {
    total,
    useful,
    notUseful,
    satisfactionPercent: total > 0 ? Math.round((useful / total) * 100) : 0,
  }
}

module.exports = { getMyFeedback, createFeedback, getFeedbackStats }