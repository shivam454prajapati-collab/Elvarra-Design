const User = require('../models/User')
const Coupon = require('../models/Coupon')
const { asyncHandler } = require('../middleware/errorHandler')
const { sendContactEmail } = require('../services/email')

// ============================================================
// USER CONTROLLER
// ============================================================

// ── GET /api/users/me ─────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user })
})

// ── PUT /api/users/me ─────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true, runValidators: true }
  )

  res.json({ user })
})

// ── DELETE /api/users/me ──────────────────────────────────────
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false })
  res.json({ message: 'Account deactivated. Contact support for full deletion.' })
})

// ── GET /api/users (admin) ────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query
  const filter = { isActive: true }
  if (search) filter.$or = [{ name: /search/i }, { email: /search/i }]

  const total = await User.countDocuments(filter)
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))

  res.json({ users, total })
})

// ============================================================
// COUPON CONTROLLER
// ============================================================

// ── POST /api/coupons/validate ────────────────────────────────
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })

  if (!coupon) {
    return res.json({ valid: false, discount: 0, message: 'Invalid coupon code.' })
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return res.json({ valid: false, discount: 0, message: 'This coupon has expired.' })
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.json({ valid: false, discount: 0, message: 'This coupon has reached its usage limit.' })
  }

  if (cartTotal < coupon.minOrderValue) {
    return res.json({
      valid: false,
      discount: 0,
      message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}.`,
    })
  }

  let discountAmount = coupon.type === 'percent'
    ? Math.round(cartTotal * coupon.discount / 100)
    : coupon.discount

  if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount)

  res.json({
    valid: true,
    discount: coupon.discount,
    type: coupon.type,
    discountAmount,
    maxDiscount: coupon.maxDiscount,
    message: coupon.type === 'percent'
      ? `${coupon.discount}% off applied! You save ₹${discountAmount}.`
      : `₹${coupon.discount} flat discount applied!`,
  })
})

// ── POST /api/coupons (admin) ─────────────────────────────────
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body)
  res.status(201).json({ coupon })
})

// ── GET /api/coupons (admin) ──────────────────────────────────
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  res.json({ coupons })
})

// ── DELETE /api/coupons/:id (admin) ──────────────────────────
const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndUpdate(req.params.id, { isActive: false })
  res.json({ message: 'Coupon deactivated.' })
})

// ============================================================
// CONTACT CONTROLLER
// ============================================================

// ── POST /api/contact ─────────────────────────────────────────
const sendContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body

  await sendContactEmail({ name, email, subject, message })

  res.json({ message: 'Your message has been received. We\'ll reply within 24 hours.' })
})

// ── POST /api/newsletter/subscribe ──────────────────────────
const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' })
  }
  // In a real setup, save to NewsletterSubscriber collection or Mailchimp/Klaviyo
  res.json({ message: 'Thank you for subscribing to Elvarra!' })
})

module.exports = {
  getProfile, updateProfile, deleteAccount, getUsers,
  validateCoupon, createCoupon, getCoupons, deleteCoupon,
  sendContact, subscribeNewsletter,
}

