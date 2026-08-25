const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'flat'], required: true },
  discount: { type: Number, required: true, min: 0 },  // % or ₹ flat
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: null },         // cap for percent coupons
  usageLimit: { type: Number, default: null },          // null = unlimited
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  description: { type: String, default: '' },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => { delete ret.__v; return ret },
  },
})

module.exports = mongoose.model('Coupon', couponSchema)
