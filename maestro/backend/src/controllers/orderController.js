// src/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders  (создать заказ из корзины)
async function createOrder(req, res) {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Пустой список товаров' });
    }

    // берём id товаров
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res
        .status(400)
        .json({ message: 'Некоторые товары не найдены' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.productId
      );
      const quantity = item.quantity > 0 ? item.quantity : 1;
      const price = product.price;

      orderItems.push({
        product: product._id,
        quantity,
        price,
      });

      totalAmount += price * quantity;
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || '',
      status: 'pending',
      paymentStatus: 'pending',
      escrowStatus: 'held',
    });

    res.status(201).json({ order });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Ошибка сервера при создании заказа' });
  }
}

// GET /api/orders/my  (мои заказы)
async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name price');

    res.json({ orders });
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении заказов' });
  }
}

// GET /api/orders/:id  (детали заказа — только владелец или админ)
async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate(
      'items.product',
      'name price'
    );

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    if (
      req.user.role !== 'admin' &&
      order.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Нет доступа к этому заказу' });
    }

    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении заказа' });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
