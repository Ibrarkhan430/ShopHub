const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

// ─── Helper: Merge Duplicate Products ──────────────────
const mergeOrderItems = (orderItems) => {
  const map = new Map();
  
  for (const item of orderItems) {
    const productId = item.product.toString();
    if (map.has(productId)) {
      // ✅ Duplicate found - merge quantity
      map.get(productId).quantity += item.quantity;
    } else {
      map.set(productId, { ...item });
    }
  }
  
  return Array.from(map.values());
};

// ─── Create Order ─────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    let { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        message: 'Please provide complete shipping address (address, city, postalCode, country)',
      });
    }

    // ✅ MERGE DUPLICATE PRODUCTS
    orderItems = mergeOrderItems(orderItems);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const products = [];
      let totalPrice = 0;
      const trustedOrderItems = [];

      for (const item of orderItems) {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock}`);
        }

        products.push({ product, quantity: item.quantity });
        totalPrice += product.price * item.quantity;

        trustedOrderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });
      }

      const order = await Order.create([{
        user: req.user._id,
        orderItems: trustedOrderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'Cash',
        totalPrice,
      }], { session });

      for (const { product, quantity } of products) {
        product.stock -= quantity;
        product.sold = (product.sold || 0) + quantity;
        await product.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json(order[0]);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── Buy Now ──────────────────────────────────────────────
const buyNow = async (req, res) => {
  try {
    const { productId, quantity, shippingAddress, paymentMethod } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product and quantity required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} items left` });
    }

    let address = shippingAddress;
    if (!address) {
      const user = await User.findById(req.user._id);
      const defaultAddr = user.addresses?.find((a) => a.isDefault);
      if (!defaultAddr) {
        return res.status(400).json({
          message: 'Please provide shipping address or set a default address in profile',
        });
      }
      address = {
        address: defaultAddr.address,
        city: defaultAddr.city,
        postalCode: defaultAddr.postalCode,
        country: defaultAddr.country,
      };
    }

    const totalPrice = product.price * quantity;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.create([{
        user: req.user._id,
        orderItems: [
          {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity,
          },
        ],
        shippingAddress: address,
        paymentMethod: paymentMethod || 'Cash',
        totalPrice,
      }], { session });

      product.stock -= quantity;
      product.sold = (product.sold || 0) + quantity;
      await product.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json(order[0]);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Cancel My Order ─────────────────────────────────────
const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: 'Not your order' });

    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled now' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product).session(session);
        if (product) {
          product.stock += item.quantity;
          product.sold = Math.max(0, (product.sold || 0) - item.quantity);
          await product.save({ session });
        }
      }

      order.status = 'cancelled';
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json(order);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get My Orders ────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Order By ID ──────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const orderUserId = order.user?._id?.toString() || order.user?.toString();
    const isOwner = orderUserId === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get All Orders ───────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Order Status (Admin) ──────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!req.body.status || !validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // ✅ SIRF YEH DO CHECKS:
    if (order.status === 'cancelled' && req.body.status !== 'cancelled') {
      return res.status(400).json({
        message: 'Cannot change status of a cancelled order',
      });
    }

    if (order.status === 'delivered' && req.body.status !== 'delivered') {
      return res.status(400).json({
        message: 'Cannot change status of a delivered order',
      });
    }

    // ✅ IF CANCELLED - RESTORE STOCK
    if (req.body.status === 'cancelled' && order.status !== 'cancelled') {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product).session(session);
          if (product) {
            product.stock += item.quantity;
            product.sold = Math.max(0, (product.sold || 0) - item.quantity);
            await product.save({ session });
          }
        }
        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }

    order.status = req.body.status;

    if (req.body.status === 'delivered') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  buyNow,
  cancelMyOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};