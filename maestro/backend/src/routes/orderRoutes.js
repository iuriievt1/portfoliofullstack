// src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require('../controllers/orderController');

const { protect } = require('../middlewares/authMiddleware');

// создать заказ
router.post('/', protect, createOrder);

// мои заказы
router.get('/my', protect, getMyOrders);

// один заказ
router.get('/:id', protect, getOrderById);

module.exports = router;
