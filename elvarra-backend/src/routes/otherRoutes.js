const express = require('express')
const { protect, adminOnly, optionalAuth } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')
const { updateProfileValidator, contactValidator, couponValidator } = require('../middleware/validators')
const {
  getProfile, updateProfile, deleteAccount, getUsers,
  validateCoupon, createCoupon, getCoupons, deleteCoupon,
  sendContact, subscribeNewsletter,
} = require('../controllers/userController')
const { createCustomOrder, getCustomOrders, updateCustomOrder } = require('../controllers/customOrderController')

// ── User / Profile ────────────────────────────────────────────
const userRouter = express.Router()
userRouter.get('/me', protect, getProfile)
userRouter.put('/me', protect, updateProfileValidator, updateProfile)
userRouter.delete('/me', protect, deleteAccount)
userRouter.get('/', protect, adminOnly, getUsers)

// ── Custom orders ─────────────────────────────────────────────
const customOrderRouter = express.Router()
customOrderRouter.post('/',
  optionalAuth,                         // attach user if logged in, ok if not
  upload.single('designFile'),          // multer handles multipart
  createCustomOrder
)
customOrderRouter.get('/', protect, adminOnly, getCustomOrders)
customOrderRouter.put('/:id', protect, adminOnly, updateCustomOrder)

// ── Coupons ───────────────────────────────────────────────────
const couponRouter = express.Router()
couponRouter.post('/validate', couponValidator, validateCoupon)
couponRouter.post('/', protect, adminOnly, createCoupon)
couponRouter.get('/', protect, adminOnly, getCoupons)
couponRouter.delete('/:id', protect, adminOnly, deleteCoupon)

// ── Contact ───────────────────────────────────────────────────
const contactRouter = express.Router()
contactRouter.post('/', contactValidator, sendContact)

// ── Newsletter ────────────────────────────────────────────────
const newsletterRouter = express.Router()
newsletterRouter.post('/subscribe', subscribeNewsletter)

module.exports = { userRouter, customOrderRouter, couponRouter, contactRouter, newsletterRouter }
