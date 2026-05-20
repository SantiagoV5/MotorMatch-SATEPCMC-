const { Router } = require('express');
const { validate } = require('../../middlewares/validation.middleware');
const { verifyAdmin } = require('../../middlewares/admin.middleware');
const { motorcycleSchema } = require('./admin.motorcycles.validation');
const controller = require('./admin.motorcycles.controller');

const router = Router();

router.use(verifyAdmin);

router.get('/', controller.listMotorcycles);
router.get('/:id', controller.getMotorcycleById);
router.post('/', validate(motorcycleSchema), controller.createMotorcycle);
router.put('/:id', validate(motorcycleSchema), controller.updateMotorcycle);
router.patch('/:id/toggle-status', controller.toggleMotorcycleStatus);
router.delete('/:id', controller.deleteMotorcycle);

module.exports = router;