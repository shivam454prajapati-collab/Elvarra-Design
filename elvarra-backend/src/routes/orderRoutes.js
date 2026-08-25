const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const { createOrderValidator, verifyPaymentValidator } = require('../middleware/validators')
const {
  createOrder, verifyPayment, getOrders, getOrder,
  updateOrderStatus, getAllOrders,
} = require('../controllers/orderController')

// ── Customer routes (require login) ──────────────────────────
router.post('/', protect, createOrderValidator, createOrder)
router.post('/verify-payment', protect, verifyPaymentValidator, verifyPayment)
router.get('/', protect, getOrders)
router.get('/:id', protect, getOrder)

// ── Admin routes ──────────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, getAllOrders)
router.put('/admin/:id/status', protect, adminOnly, updateOrderStatus)

module.exports = router
