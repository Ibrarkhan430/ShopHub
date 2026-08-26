const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const deleteImageFile = (imageUrl) => {
  if (!imageUrl) return;

  try {
    const filename = imageUrl.split('/uploads/')[1];
    if (!filename) return;

    const filePath = path.join(__dirname, '..', 'uploads', filename);

    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Failed to delete image file:', err);
      }
    });
  } catch (error) {
    console.error('Failed to delete image file:', error);
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      oldPrice,
      category,
      image,
      stock,
      tag,
    } = req.body;

    if (!name || !description || price === undefined || !category || stock === undefined) {
      return res.status(400).json({
        message: 'Please provide name, description, price, category, and stock',
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      oldPrice,
      category,
      image,
      stock,
      tag,
      createdBy: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { keyword, category, page = 1, limit = 12 } = req.query;

    const query = {};

    // SEARCH
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    // CATEGORY FILTER
    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    // ✅ FIX: Handle 'all' limit for admin
    let productsQuery = Product.find(query).sort({ createdAt: -1 });
    
    if (limit !== 'all') {
      const limitNum = Number(limit) || 12;
      const pageNum = Number(page) || 1;
      productsQuery = productsQuery
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);
    }

    const products = await productsQuery;
    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: Number(page) || 1,
      pages: limit === 'all' ? 1 : Math.ceil(total / (Number(limit) || 12)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      description,
      price,
      oldPrice,
      category,
      image,
      stock,
      tag,
    } = req.body;

    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (oldPrice !== undefined) product.oldPrice = oldPrice;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (tag !== undefined) product.tag = tag;

    const previousImage = product.image;
    if (image !== undefined) product.image = image;

    const updatedProduct = await product.save();

    if (image !== undefined && previousImage && previousImage !== image) {
      deleteImageFile(previousImage);
    }

    res.json(updatedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    deleteImageFile(product.image);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};