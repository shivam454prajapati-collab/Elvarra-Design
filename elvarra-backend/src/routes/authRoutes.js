const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')

const {
  register, login, getMe, forgotPassword, resetPassword, changePassword,
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const {
  registerValidator, loginValidator,
  forgotPasswordValidator, resetPasswordValidator,
} = require('../middleware/validators')

// Strict rate limit for auth endpoints — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Public routes ─────────────────────────────────────────────
router.post('/register', authLimiter, registerValidator, register)
router.post('/login', authLimiter, loginValidator, login)
router.post('/forgot-password', authLimiter, forgotPasswordValidator, forgotPassword)
router.post('/reset-password', authLimiter, resetPasswordValidator, resetPassword)

// ── Protected routes ──────────────────────────────────────────
router.get('/me', protect, getMe)
router.put('/change-password', protect, changePassword)

module.exports = router
