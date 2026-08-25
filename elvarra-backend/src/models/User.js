const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [80, 'Name cannot exceed 80 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // never returned in queries by default
  },
  phone: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  googleId: { type: String, default: null },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: String,
  emailVerifyExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password
      delete ret.passwordResetToken
      delete ret.passwordResetExpires
      delete ret.emailVerifyToken
      delete ret.__v
      return ret
    },
  },
})

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 hour
  return resetToken // return plain token (sent in email)
}

// Generate email verify token
userSchema.methods.createEmailVerifyToken = function () {
  const token = crypto.randomBytes(32).toString('hex')
  this.emailVerifyToken = crypto.createHash('sha256').update(token).digest('hex')
  this.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  return token
}

module.exports = mongoose.model('User', userSchema)
