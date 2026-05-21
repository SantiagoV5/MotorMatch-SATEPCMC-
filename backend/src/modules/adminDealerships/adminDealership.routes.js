const { Router } = require('express');
const { requireAuth, requireAdmin } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const adminDealershipController = require('./adminDealership.controller');
const {
  createDealershipSchema,
  updateDealershipSchema,
  listDealershipsSchema,
} = require('./adminDealership.validation');

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', validate(listDealershipsSchema, 'query'), adminDealershipController.listDealerships);
router.get('/:id', adminDealershipController.getDealershipById);
router.post('/', validate(createDealershipSchema), adminDealershipController.createDealership);
router.patch('/:id', validate(updateDealershipSchema), adminDealershipController.updateDealership);
router.delete('/:id', adminDealershipController.deactivateDealership);

module.exports = router;
