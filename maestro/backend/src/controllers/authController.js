// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
async function register(req, res) {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Пароль должен быть минимум 6 символов' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'buyer',
      profile: { name },
    });

    const token = generateToken(user);

    res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const token = generateToken(user);

    // уберём пароль из ответа
    user.password = undefined;

    res.json({
      user,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

module.exports = {
  register,
  login,
  getMe,
};
