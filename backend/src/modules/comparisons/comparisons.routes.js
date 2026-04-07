const { Router } = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { createComparison } = require('./comparisons.controller');

const router = Router();
router.use(requireAuth);
router.post('/', createComparison);

module.exports = router;
