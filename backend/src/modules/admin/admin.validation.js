const Joi = require('joi')

const listReviewsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().trim().max(100).allow('').default(''),
  visibility: Joi.string().valid('all', 'visible', 'hidden').default('all'),
  motorcycleId: Joi.number().integer().positive().optional(),
})

const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().trim().max(100).allow('').default(''),
  status: Joi.string().valid('all', 'active', 'inactive').default('all'),
})

module.exports = {
  listReviewsSchema,
  listUsersSchema,
}