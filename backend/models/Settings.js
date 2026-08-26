const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'ShopHop',
      trim: true,
    },
    storeEmail: {
      type: String,
      default: 'support@shophop.com',
      trim: true,
    },
    storePhone: {
      type: String,
      default: '+1 234 567 890',
      trim: true,
    },
    storeAddress: {
      type: String,
      default: '123 Commerce St, New York, NY 10001',
      trim: true,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'PKR'],
    },
    taxRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    shippingFee: {
      type: Number,
      default: 5.99,
      min: 0,
    },
    freeShippingThreshold: {
      type: Number,
      default: 50,
      min: 0,
    },
    logo: {
      type: String,
      default: '',
    },
    paymentMethods: {
      type: [String],
      default: ['Stripe', 'PayPal', 'Cash on Delivery'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// ✅ Singleton - sirf ek document
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);