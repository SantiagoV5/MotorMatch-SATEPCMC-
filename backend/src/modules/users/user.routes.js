const { Router } = require('express')
const { requireAuth } = require('../../middlewares/auth.middleware')
const { validate } = require('../../middlewares/validation.middleware')
const { updateUserSchema } = require('./user.validation')
const { getMyProfile, updateMyProfile } = require('./user.controller')

const router = Router()

router.get('/me', requireAuth, getMyProfile)
router.put('/me', requireAuth, validate(updateUserSchema), updateMyProfile)

module.exports = router
