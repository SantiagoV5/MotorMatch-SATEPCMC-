const { Router } = require('express');
const { verifyAdmin } = require('../../middlewares/admin.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const motorcycleRoutes = require('./admin.motorcycles.routes');
const { listReviewsSchema, listUsersSchema } = require('./admin.validation');
const adminController = require('./admin.controller');

const router = Router();

router.use(verifyAdmin);
router.use('/motorcycles', motorcycleRoutes);

router.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Panel de administrador habilitado',
    section: 'dashboard',
  });
});

router.get('/stats', adminController.getDashboardStats);
router.get('/reviews', validate(listReviewsSchema, 'query'), adminController.listReviews);
router.patch('/reviews/:id/toggle-visibility', adminController.toggleReviewVisibility);
router.delete('/reviews/:id', adminController.deleteReview);
router.get('/users', validate(listUsersSchema, 'query'), adminController.listUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

router.get('/me', (req, res) => {
  res.status(200).json({
    message: 'Administrador autenticado',
    user: req.user,
  });
});

module.exports = router;