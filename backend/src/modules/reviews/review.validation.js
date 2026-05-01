const Joi = require('joi')

const listReviewsSchema = Joi.object({
  motorcycleId: Joi.number().integer().positive().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(20).default(5),
})

const createReviewSchema = Joi.object({
  motorcycleId: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().min(20).max(500).required(),
})

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().trim().min(20).max(500),
}).or('rating', 'comment')

module.exports = {
  listReviewsSchema,
  createReviewSchema,
  updateReviewSchema,
}