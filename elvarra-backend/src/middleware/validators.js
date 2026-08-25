const { body, param, query, validationResult } = require('express-validator')

// ── Run validation and return errors ─────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg)
    return res.status(400).json({ message: messages[0], errors: messages })
  }
  next()
}

// ── Auth validators ───────────────────────────────────────────
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).withMessage('Name too long'),
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  validate,
]

const loginValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
]

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  validate,
]

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  validate,
]

// ── Order validators ──────────────────────────────────────────
const createOrderValidator = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.productId').notEmpty().withMessage('Product ID required'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.selectedSize').notEmpty().withMessage('Size is required for each item'),
  body('shippingAddress.name').trim().notEmpty().withMessage('Shipping name is required'),
  body('shippingAddress.email').trim().isEmail().withMessage('Valid shipping email required'),
  body('shippingAddress.phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.pincode').trim().matches(/^\d{6}$/).withMessage('Enter a valid 6-digit pincode'),
  body('paymentMethod').isIn(['razorpay', 'upi', 'cod']).withMessage('Invalid payment method'),
  validate,
]

const verifyPaymentValidator = [
  body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID required'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID required'),
  body('razorpaySignature').notEmpty().withMessage('Razorpay signature required'),
  validate,
]

// ── Profile validator ─────────────────────────────────────────
const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 80 }),
  body('phone').optional().trim().matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit mobile number'),
  validate,
]

// ── Contact validator ─────────────────────────────────────────
const contactValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Enter a valid email'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  validate,
]

// ── Coupon validator ──────────────────────────────────────────
const couponValidator = [
  body('code').trim().notEmpty().withMessage('Coupon code is required').toUpperCase(),
  body('cartTotal').isFloat({ min: 0 }).withMessage('Cart total must be a positive number'),
  validate,
]

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  createOrderValidator,
  verifyPaymentValidator,
  updateProfileValidator,
  contactValidator,
  couponValidator,
}
