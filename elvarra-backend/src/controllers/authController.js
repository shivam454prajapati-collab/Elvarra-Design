const crypto = require('crypto')
const User = require('../models/User')
const { generateToken } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require('../services/email')

// ── Helper: send token response ───────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id)
  res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    },
  })
}

// ── POST /api/auth/register ────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists.' })
  }

  const user = await User.create({ name, email, password })

  // Send welcome email (non-blocking)
  sendWelcomeEmail({ name, email }).catch(console.error)

  sendTokenResponse(user, 201, res)
})

// ── POST /api/auth/login ───────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')
  if (!user || !user.password) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  if (!user.isActive) {
    return res.status(401).json({ message: 'Your account has been deactivated. Contact support.' })
  }

  sendTokenResponse(user, 200, res)
})

// ── GET /api/auth/me ───────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  res.json({ user: req.user })
})

// ── POST /api/auth/forgot-password ────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  // Always return 200 — don't reveal if email exists (security)
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link has been sent.' })
  }

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  await sendPasswordResetEmail({ name: user.name, email, resetToken })

  res.json({ message: 'If that email exists, a reset link has been sent.' })
})

// ── POST /api/auth/reset-password ─────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body

  // Hash the plain token and find matching user
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) {
    return res.status(400).json({ message: 'Reset link is invalid or has expired.' })
  }

  user.password = newPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  sendTokenResponse(user, 200, res)
})

// ── PUT /api/auth/change-password ─────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id).select('+password')

  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect.' })
  }

  if (newPassword.length < 8 || !/\d/.test(newPassword)) {
    return res.status(400).json({ message: 'New password must be at least 8 characters and contain a number.' })
  }

  user.password = newPassword
  await user.save()

  sendTokenResponse(user, 200, res)
})

module.exports = { register, login, getMe, forgotPassword, resetPassword, changePassword }
