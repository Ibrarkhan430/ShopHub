const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createReview,
  getReviews,
  getProductReviews,
  updateStatus,
  deleteReview,
} = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/', protect, admin, getReviews);
router.get('/product/:id', getProductReviews);
router.put('/:id/status', protect, admin, updateStatus);
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;