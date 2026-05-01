const reviewService = require('./review.service')

async function getMotorcycleReviews(req, res, next) {
  try {
    const data = await reviewService.getMotorcycleReviews({
      motorcycleId: req.query.motorcycleId,
      page: req.query.page,
      limit: req.query.limit,
      userId: req.user?.id || null,
    })

    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

async function createReview(req, res, next) {
  try {
    const review = await reviewService.createReview(req.user.id, req.body)
    res.status(201).json({ success: true, data: review })
  } catch (error) {
    next(error)
  }
}

async function updateReview(req, res, next) {
  try {
    const review = await reviewService.updateReview(req.params.id, req.user.id, req.body)
    res.json({ success: true, data: review })
  } catch (error) {
    next(error)
  }
}

async function deleteReview(req, res, next) {
  try {
    const result = await reviewService.deleteReview(req.params.id, req.user.id)
    res.json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getMotorcycleReviews,
  createReview,
  updateReview,
  deleteReview,
}