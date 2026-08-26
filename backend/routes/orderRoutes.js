const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  buyNow,
  cancelMyOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.post('/buy-now', protect, buyNow);
router.get('/myorders', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelMyOrder);

// Payment placeholder (baad mein Stripe/Razorpay laga dena)
router.put('/:id/pay', protect, (req, res) => res.json({ message: 'Order paid' }));

module.exports = router;