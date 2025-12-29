// src/controllers/productController.js
const Product = require('../models/Product');

// POST /api/products  (только продавец/админ)
async function createProduct(req, res) {
  try {
    const { name, description, price, category, images, type, stock_quantity } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Название и цена обязательны' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images: images || [],
      type: type || 'physical',
      stock_quantity: stock_quantity ?? 0,
      seller_id: req.user.id,
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Ошибка сервера при создании товара' });
  }
}

// GET /api/products  — все товары (общий каталог)
async function getProducts(req, res) {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ products });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении товаров' });
  }
}

// GET /api/products/my — товары текущего продавца
async function getMyProducts(req, res) {
  try {
    const products = await Product.find({ seller_id: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({ products });
  } catch (err) {
    console.error('Get my products error:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении товаров' });
  }
}

// GET /api/products/:id
async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json({ product });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении товара' });
  }
}

// PUT /api/products/:id  (только владелец товара или админ)
async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // если не админ и не владелец
    if (req.user.role !== 'admin' && product.seller_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав для редактирования товара' });
    }

    const fields = ['name', 'description', 'price', 'category', 'images', 'type', 'stock_quantity'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    res.json({ product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Ошибка сервера при обновлении товара' });
  }
}

// DELETE /api/products/:id  (только владелец товара или админ)
async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    if (req.user.role !== 'admin' && product.seller_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав для удаления товара' });
    }

    await product.deleteOne();
    res.json({ message: 'Товар удалён' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Ошибка сервера при удалении товара' });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
