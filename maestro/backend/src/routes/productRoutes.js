// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect, requireRole } = require('../middlewares/authMiddleware');

// публичные
router.get('/', getProducts);

// 👇 ВАЖНО: /my ДОЛЖЕН быть ДО /:id
router.get('/my', protect, requireRole('seller', 'admin'), getMyProducts);

// публичный просмотр конкретного товара
router.get('/:id', getProductById);

// только авторизованные продавцы/админы
router.post('/', protect, requireRole('seller', 'admin'), createProduct);
router.put('/:id', protect, requireRole('seller', 'admin'), updateProduct);
router.delete('/:id', protect, requireRole('seller', 'admin'), deleteProduct);

module.exports = router;
