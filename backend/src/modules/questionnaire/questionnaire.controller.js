const prisma = require('../../config/database')
const { processQuestionnaire } = require('./questionnaire.service')

// GET /api/questionnaire/my
async function getMyQuestionnaire(req, res, next) {
  try {
    const questionnaire = await prisma.questionnaire.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, completedAt: true },
    })
    res.json({ exists: !!questionnaire, questionnaire: questionnaire || null })
  } catch (err) {
    next(err)
  }
}

// GET /api/questionnaire/my/recommendations
async function getMyRecommendations(req, res, next) {
  try {
    // Fetch questionnaire profile data alongside recommendations
    const [recommendations, questionnaire] = await Promise.all([
      prisma.recommendation.findMany({
        where: { userId: req.user.id },
        orderBy: { compatibilityScore: 'desc' },
        take: 10,
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
              currency: true,
              imageUrl: true,
              seatHeightCm: true,
              weightKg: true,
              consumptionKmpl: true,
            },
          },
        },
      }),
      prisma.questionnaire.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        select: { budget: true, usageType: true, heightCm: true },
      }),
    ])
    res.json({ recommendations, questionnaire })
  } catch (err) {
    next(err)
  }
}

// POST /api/questionnaire
async function submitQuestionnaire(req, res, next) {
  try {
    const result = await processQuestionnaire(req.user.id, req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = { submitQuestionnaire, getMyQuestionnaire, getMyRecommendations }
