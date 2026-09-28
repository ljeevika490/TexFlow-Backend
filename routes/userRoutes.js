const express = require('express');
const router = express.Router();
const {
  getSellers,
  getAdminStats,
  getSellerStats,
  updateProfile,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/sellers', authorize('ADMIN'), getSellers);
router.get('/admin-stats', authorize('ADMIN'), getAdminStats);
router.get('/seller-stats', authorize('SELLER'), getSellerStats);
router.put('/profile', updateProfile);

module.exports = router;
