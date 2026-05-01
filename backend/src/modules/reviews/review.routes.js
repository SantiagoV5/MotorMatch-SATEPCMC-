const { Router } = require('express')
const { requireAuth, optionalAuth } = require('../../middlewares/auth.middleware')
const { validate } = require('../../middlewares/validation.middleware')
const { listReviewsSchema, createReviewSchema, updateReviewSchema } = require('./review.validation')
const { getMotorcycleReviews, createReview, updateReview, deleteReview } = require('./review.controller')

const router = Router()

router.get('/', optionalAuth, validate(listReviewsSchema, 'query'), getMotorcycleReviews)
router.post('/', requireAuth, validate(createReviewSchema), createReview)
router.put('/:id', requireAuth, validate(updateReviewSchema), updateReview)
router.delete('/:id', requireAuth, deleteReview)

module.exports = router