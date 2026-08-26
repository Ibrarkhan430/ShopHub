const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Helper: Recalculate product rating
const recalcProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, status: 'approved' });
  const prod = await Product.findById(productId);
  if (prod) {
    prod.numReviews = reviews.length;
    prod.rating = reviews.length
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0;
    await prod.save();
  }
};

// ─── Create Review ─────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // ✅ PRODUCT CHECK
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ✅ CHECK IF ALREADY REVIEWED
    const alreadyReviewed = await Review.findOne({ user: req.user._id, product });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // ✅ REMOVED: Purchase check - Sab users ko review dene do!

    const review = await Review.create({
      user: req.user._id,
      product,
      name: req.user.name,
      rating: Number(rating),
      comment: comment || '',
      status: 'pending', // ✅ Admin approval required
    });

    await recalcProductRating(product);
    res.status(201).json({ 
      message: 'Review submitted! Pending admin approval.',
      review 
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Get All Reviews (Admin) ──────────────────────────────
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    
    const total = await Review.countDocuments();
    const approved = await Review.countDocuments({ status: 'approved' });
    const pending = await Review.countDocuments({ status: 'pending' });
    const rejected = await Review.countDocuments({ status: 'rejected' });

    res.json({ reviews, total, approved, pending, rejected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Product Reviews (Public) ─────────────────────────
const getProductReviews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const reviews = await Review.find({ product: req.params.id, status: 'approved' })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Review Status (Admin) ─────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be: pending, approved, or rejected',
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });

    review.status = status;
    await review.save();

    await recalcProductRating(review.product);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete Review (Admin) ────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid review ID format' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    await review.deleteOne();

    await recalcProductRating(review.product);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews,
  getProductReviews,
  updateStatus,
  deleteReview,
};