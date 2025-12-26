// src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, index: true },
    images: [{ type: String }],
    video: { type: String },
    options: [
      {
        label: String, // например "Размер"
        value: String, // например "M"
      },
    ],
    stock_quantity: { type: Number, default: 0 },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['physical', 'digital', 'service', 'course'],
      default: 'physical',
    },
    ratingAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
