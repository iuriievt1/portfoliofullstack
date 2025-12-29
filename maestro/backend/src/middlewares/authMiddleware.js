// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Нет токена, доступ запрещён' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Невалидный или истёкший токен' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }
    next();
  };
}

module.exports = { protect, requireRole };
