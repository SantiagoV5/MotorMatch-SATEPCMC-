const adminService = require('./admin.service')

async function getDashboardStats(_req, res, next) {
  try {
    const data = await adminService.getDashboardStats()
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

async function listReviews(req, res, next) {
  try {
    const data = await adminService.listReviews(req.query)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

async function toggleReviewVisibility(req, res, next) {
  try {
    const review = await adminService.toggleReviewVisibility(req.params.id)
    res.json({ success: true, data: review, message: review.isVisible ? 'La reseña volvió a ser visible.' : 'La reseña quedó oculta.' })
  } catch (error) {
    next(error)
  }
}

async function deleteReview(req, res, next) {
  try {
    const data = await adminService.deleteReview(req.params.id)
    res.json({ success: true, data, message: 'Reseña eliminada correctamente.' })
  } catch (error) {
    next(error)
  }
}

async function listUsers(req, res, next) {
  try {
    const data = await adminService.listUsers(req.query)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

async function toggleUserStatus(req, res, next) {
  try {
    const data = await adminService.toggleUserStatus(req.params.id, req.user.id)
    res.json({ success: true, data, message: data.isActive ? 'Usuario reactivado correctamente.' : 'Usuario deshabilitado correctamente.' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getDashboardStats,
  listReviews,
  toggleReviewVisibility,
  deleteReview,
  listUsers,
  toggleUserStatus,
}