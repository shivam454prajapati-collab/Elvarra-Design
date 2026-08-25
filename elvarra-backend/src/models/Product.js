const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['crew-neck', 'oversized', 'polo', 'v-neck', 'henley', 'other'],
    default: 'crew-neck',
  },
  colors: [{ type: String }],          // hex codes e.g. ['#FFFFFF', '#2C2C2C']
  sizes: [{ type: String }],           // e.g. ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  images: [{ type: String }],          // Cloudinary URLs or local paths
  badge: { type: String, default: null }, // 'Bestseller', 'New', 'Limited', null
  stock: { type: Number, default: 100, min: 0 },
  isActive: { type: Boolean, default: true },
  soldCount: { type: Number, default: 0 },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => { delete ret.__v; return ret },
  },
})

// Text search index
productSchema.index({ name: 'text', description: 'text' })
productSchema.index({ category: 1, isActive: 1 })
productSchema.index({ price: 1 })

module.exports = mongoose.model('Product', productSchema)
