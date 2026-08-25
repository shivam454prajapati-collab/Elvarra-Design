const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ── Protect: require valid JWT ────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please sign in.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' })
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account has been deactivated.' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please sign in again.', expired: true })
    }
    return res.status(401).json({ message: 'Invalid token. Please sign in again.' })
  }
}

// ── Admin only ────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' })
  }
  next()
}

// ── Optional auth (attach user if token present, don't fail if not) ──
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
    }
  } catch (_) {
    // Silently ignore — user stays undefined
  }
  next()
}

// ── Generate JWT ───────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

module.exports = { protect, adminOnly, optionalAuth, generateToken }
