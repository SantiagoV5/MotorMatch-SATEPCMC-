const { Router } = require('express')
const { requireAuth } = require('../../middlewares/auth.middleware')
const { validate } = require('../../middlewares/validation.middleware')
const { questionnaireSchema } = require('./questionnaire.validation')
const { submitQuestionnaire } = require('./questionnaire.controller')

const router = Router()

router.post('/', requireAuth, validate(questionnaireSchema), submitQuestionnaire)

module.exports = router
