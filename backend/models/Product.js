const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    oldPrice: { type: Number, min: 0 },
    // ✅ Category as String (pehle wala)
    category: { type: String, required: [true, 'Category is required'] },
    image: { type: String, default: '' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    tag: { type: String, enum: ['none', 'new', 'bestseller', 'sale'], default: 'none' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    sold: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);