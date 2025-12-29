// src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      // общий статус заказа
      type: String,
      enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    escrowStatus: {
      // базовый флаг для escrow
      type: String,
      enum: ['none', 'held', 'released', 'refunded'],
      default: 'held', // пока считаем, что деньги удерживаются
    },
    shippingAddress: {
      type: String,
    },
    paymentMethod: {
      type: String,
      default: 'card', // потом привяжем к Stripe/др
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
