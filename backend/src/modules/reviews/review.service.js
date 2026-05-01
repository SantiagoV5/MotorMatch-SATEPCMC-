const prisma = require('../../config/database')

const BLOCKED_WORDS = ['puta', 'mierda', 'imbecil', 'idiota', 'estupido', 'gonorrea']

function normalizeText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function normalizeReview(review, currentUserId = null) {
  if (!review) return null

  return {
    id: review.id,
    userId: review.userId,
    motorcycleId: review.motorcycleId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    isMine: currentUserId ? Number(review.userId) === Number(currentUserId) : false,
    user: review.user
      ? {
          id: review.user.id,
          name: review.user.fullName,
        }
      : null,
  }
}

function detectBlockedWord(comment) {
  const normalized = normalizeText(comment).toLowerCase()
  return BLOCKED_WORDS.find((word) => normalized.includes(word)) || null
}

async function getMotorcycleReviews({ motorcycleId, page = 1, limit = 5, userId = null }) {
  const motorcycleIdNumber = Number.parseInt(motorcycleId, 10)
  const pageNumber = Number.parseInt(page, 10) || 1
  const pageSize = Number.parseInt(limit, 10) || 5
  const skip = (pageNumber - 1) * pageSize

  if (!Number.isFinite(motorcycleIdNumber) || motorcycleIdNumber <= 0) {
    const error = new Error('motorcycleId inválido')
    error.statusCode = 400
    throw error
  }

  const [summary, reviews, currentUserReview, totalReviews] = await Promise.all([
    prisma.review.aggregate({
      where: { motorcycleId: motorcycleIdNumber },
      _avg: { rating: true },
    }),
    prisma.review.findMany({
      where: { motorcycleId: motorcycleIdNumber },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip,
      include: {
        user: { select: { id: true, fullName: true } },
      },
    }),
    userId
      ? prisma.review.findUnique({
          where: {
            unique_user_motorcycle_review: {
              userId,
              motorcycleId: motorcycleIdNumber,
            },
          },
          include: {
            user: { select: { id: true, fullName: true } },
          },
        })
      : Promise.resolve(null),
    prisma.review.count({ where: { motorcycleId: motorcycleIdNumber } }),
  ])

  return {
    summary: {
      averageRating: Number(summary._avg.rating || 0),
      totalReviews,
    },
    reviews: reviews.map((review) => normalizeReview(review, userId)),
    currentUserReview: normalizeReview(currentUserReview, userId),
    pagination: {
      page: pageNumber,
      limit: pageSize,
      totalReviews,
      hasMore: skip + reviews.length < totalReviews,
    },
  }
}

async function createReview(userId, payload) {
  const motorcycleId = Number.parseInt(payload.motorcycleId, 10)
  const rating = Number.parseInt(payload.rating, 10)
  const comment = normalizeText(payload.comment)

  if (!Number.isFinite(motorcycleId) || motorcycleId <= 0) {
    const error = new Error('motorcycleId inválido')
    error.statusCode = 400
    throw error
  }

  const blockedWord = detectBlockedWord(comment)
  if (blockedWord) {
    const error = new Error(`El comentario contiene una palabra no permitida: ${blockedWord}`)
    error.statusCode = 400
    throw error
  }

  const motorcycle = await prisma.motorcycle.findUnique({
    where: { id: motorcycleId },
    select: { id: true },
  })

  if (!motorcycle) {
    const error = new Error('La motocicleta no existe')
    error.statusCode = 404
    throw error
  }

  const review = await prisma.review.create({
    data: {
      userId,
      motorcycleId,
      rating,
      comment,
    },
    include: {
      user: { select: { id: true, fullName: true } },
    },
  })

  return normalizeReview(review, userId)
}

async function updateReview(reviewId, userId, payload) {
  const id = Number.parseInt(reviewId, 10)
  const review = await prisma.review.findUnique({ where: { id } })

  if (!review) {
    const error = new Error('Reseña no encontrada')
    error.statusCode = 404
    throw error
  }

  if (Number(review.userId) !== Number(userId)) {
    const error = new Error('No autorizado')
    error.statusCode = 403
    throw error
  }

  const nextComment = payload.comment !== undefined ? normalizeText(payload.comment) : undefined
  if (nextComment !== undefined) {
    const blockedWord = detectBlockedWord(nextComment)
    if (blockedWord) {
      const error = new Error(`El comentario contiene una palabra no permitida: ${blockedWord}`)
      error.statusCode = 400
      throw error
    }
  }

  const updatedReview = await prisma.review.update({
    where: { id },
    data: {
      ...(payload.rating !== undefined ? { rating: Number.parseInt(payload.rating, 10) } : {}),
      ...(nextComment !== undefined ? { comment: nextComment } : {}),
    },
    include: {
      user: { select: { id: true, fullName: true } },
    },
  })

  return normalizeReview(updatedReview, userId)
}

async function deleteReview(reviewId, userId) {
  const id = Number.parseInt(reviewId, 10)
  const review = await prisma.review.findUnique({ where: { id } })

  if (!review) {
    const error = new Error('Reseña no encontrada')
    error.statusCode = 404
    throw error
  }

  if (Number(review.userId) !== Number(userId)) {
    const error = new Error('No autorizado')
    error.statusCode = 403
    throw error
  }

  await prisma.review.delete({ where: { id } })
  return { deleted: true }
}

module.exports = {
  getMotorcycleReviews,
  createReview,
  updateReview,
  deleteReview,
}