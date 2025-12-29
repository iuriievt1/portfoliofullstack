// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // по умолчанию пароль не возвращаем
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },
    profile: {
      name: { type: String },
      avatar: { type: String },
      bio: { type: String },
    },
    kycStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
  },
  { timestamps: true }
);

// убираем пароль при toJSON()
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
