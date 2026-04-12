const { Router } = require('express')
const { requireAuth } = require('../../middlewares/auth.middleware')
const { trackShare } = require('./share.controller')

const router = Router()

router.post('/share', requireAuth, trackShare)

module.exports = router