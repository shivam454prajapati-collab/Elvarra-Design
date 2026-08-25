// ── Global error handler (must be last middleware in app.js) ──
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ message: messages[0], errors: messages })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const value = err.keyValue[field]
    return res.status(409).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' is already registered.` })
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` })
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 20MB.' })
  }

  // Multer file type error (our custom message)
  if (err.message?.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message })
  }

  // JWT errors (should be caught in auth middleware, but just in case)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired.', expired: true })
  }

  // Default
  const statusCode = err.statusCode || 500
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Something went wrong. Please try again.'
    : err.message || 'Internal server error'

  res.status(statusCode).json({ message })
}

// ── 404 handler ────────────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` })
}

// ── Async error wrapper ────────────────────────────────────────
// Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = { errorHandler, notFound, asyncHandler }
