const prisma = require('../../config/database')
const { ensureReviewVisibilityColumn } = require('../reviews/review.schema')

function createError(message, statusCode) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function normalizeReview(review) {
  if (!review) return null

  return {
    id: review.id,
    userId: review.userId,
    motorcycleId: review.motorcycleId,
    rating: review.rating,
    comment: review.comment,
    isVisible: Boolean(review.isVisible),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: review.user
      ? {
          id: review.user.id,
          fullName: review.user.fullName,
          email: review.user.email,
          isActive: Boolean(review.user.isActive),
        }
      : null,
    motorcycle: review.motorcycle
      ? {
          id: review.motorcycle.id,
          brand: review.motorcycle.brand,
          model: review.motorcycle.model,
          year: review.motorcycle.year,
        }
      : null,
  }
}

function normalizeUser(user) {
  if (!user) return null

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    city: user.city,
    isActive: Boolean(user.isActive),
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    reviewsCount: normalizeNumber(user._count?.reviews, 0),
  }
}

async function getDashboardStats() {
  await ensureReviewVisibilityColumn()

  const [
    totalUsers,
    activeUsers,
    disabledUsers,
    totalMotorcycles,
    activeMotorcycles,
    totalReviews,
    visibleReviews,
    hiddenReviews,
    averageRating,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.motorcycle.count(),
    prisma.motorcycle.count({ where: { isActive: true } }),
    prisma.review.count(),
    prisma.review.count({ where: { isVisible: true } }),
    prisma.review.count({ where: { isVisible: false } }),
    prisma.review.aggregate({ where: { isVisible: true }, _avg: { rating: true } }),
  ])

  return {
    message: 'Estadísticas administrativas cargadas correctamente.',
    section: 'Dashboard',
    totals: {
      users: totalUsers,
      activeUsers,
      disabledUsers,
      motorcycles: totalMotorcycles,
      activeMotorcycles,
      reviews: totalReviews,
      visibleReviews,
      hiddenReviews,
      averageRating: Number(averageRating._avg.rating || 0),
    },
  }
}

async function listReviews({ page = 1, limit = 10, search = '', visibility = 'all', motorcycleId = null }) {
  await ensureReviewVisibilityColumn()

  const pageNumber = normalizeNumber(page, 1)
  const pageSize = Math.min(normalizeNumber(limit, 10), 50)
  const skip = (pageNumber - 1) * pageSize
  const motorcycleIdNumber = motorcycleId ? Number.parseInt(motorcycleId, 10) : null
  const normalizedSearch = String(search || '').trim()

  const where = {
    ...(Number.isFinite(motorcycleIdNumber) && motorcycleIdNumber > 0 ? { motorcycleId: motorcycleIdNumber } : {}),
    ...(visibility === 'visible' ? { isVisible: true } : visibility === 'hidden' ? { isVisible: false } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            { comment: { contains: normalizedSearch, mode: 'insensitive' } },
            { user: { fullName: { contains: normalizedSearch, mode: 'insensitive' } } },
            { user: { email: { contains: normalizedSearch, mode: 'insensitive' } } },
            { motorcycle: { brand: { contains: normalizedSearch, mode: 'insensitive' } } },
            { motorcycle: { model: { contains: normalizedSearch, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }

  const [totalReviews, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        user: {
           select: { id: true, fullName: true, email: true, isActive: true },
        },
        motorcycle: {
          select: { id: true, brand: true, model: true, year: true },
        },
      },
    }),
  ])

  return {
    reviews: reviews.map(normalizeReview),
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total: totalReviews,
      hasMore: skip + reviews.length < totalReviews,
    },
  }
}

async function toggleReviewVisibility(reviewId) {
  await ensureReviewVisibilityColumn()

  const id = Number.parseInt(reviewId, 10)
  if (!Number.isFinite(id) || id <= 0) {
    throw createError('Reseña inválida', 400)
  }

  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) throw createError('Reseña no encontrada', 404)

  const updated = await prisma.review.update({
    where: { id },
    data: { isVisible: !review.isVisible },
    include: {
      user: {
          select: { id: true, fullName: true, email: true, isActive: true },
      },
      motorcycle: {
        select: { id: true, brand: true, model: true, year: true },
      },
    },
  })

  return normalizeReview(updated)
}

async function deleteReview(reviewId) {
  await ensureReviewVisibilityColumn()

  const id = Number.parseInt(reviewId, 10)
  if (!Number.isFinite(id) || id <= 0) {
    throw createError('Reseña inválida', 400)
  }

  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) throw createError('Reseña no encontrada', 404)

  await prisma.review.delete({ where: { id } })
  return { deleted: true }
}

async function listUsers({ page = 1, limit = 10, search = '', status = 'all' }) {
  const pageNumber = normalizeNumber(page, 1)
  const pageSize = Math.min(normalizeNumber(limit, 10), 50)
  const skip = (pageNumber - 1) * pageSize
  const normalizedSearch = String(search || '').trim()

  const where = {
    ...(status === 'active' ? { isActive: true } : status === 'inactive' ? { isActive: false } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            { fullName: { contains: normalizedSearch, mode: 'insensitive' } },
            { email: { contains: normalizedSearch, mode: 'insensitive' } },
            { city: { contains: normalizedSearch, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [totalUsers, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        fullName: true,
        email: true,
        city: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        _count: { select: { reviews: true } },
      },
    }),
  ])

  return {
    users: users.map(normalizeUser),
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total: totalUsers,
      hasMore: skip + users.length < totalUsers,
    },
  }
}

async function toggleUserStatus(userId, currentAdminId) {
  const id = Number.parseInt(userId, 10)
  if (!Number.isFinite(id) || id <= 0) {
    throw createError('Usuario inválido', 400)
  }

  if (Number(id) === Number(currentAdminId)) {
    throw createError('No puedes deshabilitar tu propia cuenta de administrador.', 400)
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      city: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
      _count: { select: { reviews: true } },
    },
  })

  if (!user) throw createError('Usuario no encontrado', 404)

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      fullName: true,
      email: true,
      city: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
      _count: { select: { reviews: true } },
    },
  })

  return normalizeUser(updated)
}

module.exports = {
  getDashboardStats,
  listReviews,
  toggleReviewVisibility,
  deleteReview,
  listUsers,
  toggleUserStatus,
}