const mongoose = require('mongoose')

const customOrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // T-Shirt config
  tshirtType: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },

  // Print config
  printMethod: { type: String, enum: ['dtf', 'screen', 'embroidery'], required: true },
  printArea: { type: String, required: true },

  // Design file
  designFileUrl: { type: String, required: true },    // Cloudinary URL or local path
  designFilePublicId: { type: String, default: null }, // Cloudinary public_id for deletion

  notes: { type: String, default: '' },

  // Contact
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },

  status: {
    type: String,
    enum: ['pending_review', 'quoted', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending_review',
  },
  estimatedPrice: { type: Number, default: null },
  adminNotes: { type: String, default: '' },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => { delete ret.__v; return ret },
  },
})

customOrderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model('CustomOrder').countDocuments()
    this.orderId = `CO-${Date.now()}-${String(count + 1).padStart(4, '0')}`
  }
  next()
})

module.exports = mongoose.model('CustomOrder', customOrderSchema)
