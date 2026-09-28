const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getOrders)
  .post(createOrder);

router
  .route('/:id')
  .get(getOrderById)
  .put(updateOrder)
  .delete(authorize('ADMIN'), deleteOrder);

module.exports = router;
