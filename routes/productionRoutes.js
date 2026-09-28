const express = require('express');
const router = express.Router();
const {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
} = require('../controllers/productionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router
  .route('/')
  .get(getBatches)
  .post(createBatch);

router
  .route('/:id')
  .get(getBatchById)
  .put(updateBatch)
  .delete(deleteBatch);

module.exports = router;
