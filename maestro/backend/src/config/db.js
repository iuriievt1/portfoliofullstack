// src/config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️  MONGO_URI не задан в .env, пропускаю подключение к базе');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
}

module.exports = connectDB;
