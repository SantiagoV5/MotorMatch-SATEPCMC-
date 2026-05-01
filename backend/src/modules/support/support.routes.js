const { Router } = require('express')

const { validate } = require('../../middlewares/validation.middleware')
const { createSupportMessageSchema } = require('./support.validation')
const { createSupportMessage } = require('./support.controller')

const router = Router()

router.post('/', validate(createSupportMessageSchema), createSupportMessage)

module.exports = router