const crypto = require('crypto')
const Razorpay = require('razorpay')
const Order = require('../models/Order')
const Product = require('../models/Product')
const Coupon = require('../models/Coupon')
const { asyncHandler } = require('../middleware/errorHandler')
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../services/email')

// ── Razorpay instance ─────────────────────────────────────────
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('XXXX')) {
    return null // Razorpay not configured
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

// ── Price calculation helper ──────────────────────────────────
const calcPrices = (items, coupon, paymentMethod) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const shipping = subtotal >= 999 ? 0 : 99
  const codFee = paymentMethod === 'cod' ? 50 : 0

  let discount = 0
  if (coupon?.valid) {
    if (coupon.type === 'percent') {
      discount = Math.round(subtotal * coupon.discount / 100)
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    } else {
      discount = coupon.discount
    }
  }

  const total = subtotal + shipping + codFee - discount
  return { subtotal, shipping, codFee, discount, total }
}

// ── POST /api/orders ───────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body

  // 1. Validate all product IDs and prices
  const productIds = items.map(i => i.productId)
  const dbProducts = await Product.find({ _id: { $in: productIds }, isActive: true })

  if (dbProducts.length !== items.length) {
    return res.status(400).json({ message: 'One or more products not found or unavailable.' })
  }

  // Build items with server-side prices (never trust client prices)
  const orderItems = items.map(item => {
    const product = dbProducts.find(p => p._id.toString() === item.productId)
    return {
      productId: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,       // ← server price, not client price
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      qty: item.qty,
    }
  })

  // 2. Validate & apply coupon
  let couponData = null
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true })
    if (coupon) {
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return res.status(400).json({ message: 'This coupon has expired.' })
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'This coupon has reached its usage limit.' })
      }
      const subtotalCheck = orderItems.reduce((s, i) => s + i.price * i.qty, 0)
      if (subtotalCheck < coupon.minOrderValue) {
        return res.status(400).json({ message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}.` })
      }
      couponData = { valid: true, type: coupon.type, discount: coupon.discount, maxDiscount: coupon.maxDiscount }
    }
  }

  // 3. Calculate prices server-side
  const { subtotal, shipping, codFee, discount, total } = calcPrices(orderItems, couponData, paymentMethod)

  // 4. Create Razorpay order (if not COD)
  let razorpayOrderId = null
  if (paymentMethod !== 'cod') {
    const razorpay = getRazorpay()
    if (razorpay) {
      const rzpOrder = await razorpay.orders.create({
        amount: total * 100, // paise
        currency: 'INR',
        receipt: `elvarra_${Date.now()}`,
      })
      razorpayOrderId = rzpOrder.id
    }
  }

  // 5. Save order to DB
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    razorpayOrderId,
    subtotal,
    shipping,
    codFee,
    discount,
    total,
    couponCode: couponCode?.toUpperCase() || null,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
    statusHistory: [{ status: paymentMethod === 'cod' ? 'confirmed' : 'pending', note: 'Order created' }],
  })

  // 6. For COD: send confirmation immediately
  if (paymentMethod === 'cod') {
    if (couponCode) await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } })
    await Product.updateMany({ _id: { $in: productIds } }, { $inc: { soldCount: 1 } })
    sendOrderConfirmationEmail({ name: req.user.name, email: req.user.email, order: { ...order.toJSON(), items: orderItems } }).catch(console.error)
  }

  res.status(201).json({
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      amount: total * 100,         // paise — for Razorpay frontend
      razorpayOrderId,             // null for COD
      total,
      status: order.status,
    },
  })
})

// ── POST /api/orders/verify-payment ───────────────────────────
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  // 1. Verify HMAC signature
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (keySecret && !keySecret.includes('XXXX')) {
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' })
    }
  }

  // 2. Find order and update
  const order = await Order.findOne({ razorpayOrderId })
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' })
  }

  order.paymentStatus = 'paid'
  order.paymentMethod = 'razorpay'
  order.razorpayPaymentId = razorpayPaymentId
  order.razorpaySignature = razorpaySignature
  order.status = 'confirmed'
  order.statusHistory.push({ status: 'confirmed', note: `Payment confirmed. Payment ID: ${razorpayPaymentId}` })
  await order.save()

  // 3. Increment sold counts, consume coupon
  const productIds = order.items.map(i => i.productId)
  await Product.updateMany({ _id: { $in: productIds } }, { $inc: { soldCount: 1 } })
  if (order.couponCode) {
    await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } })
  }

  // 4. Send confirmation email
  const user = req.user
  sendOrderConfirmationEmail({ name: user.name, email: user.email, order: order.toJSON() }).catch(console.error)

  res.json({ success: true, order: { orderNumber: order.orderNumber, status: order.status } })
})

// ── GET /api/orders ────────────────────────────────────────────
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)

  res.json({ orders })
})

// ── GET /api/orders/:id ────────────────────────────────────────
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
  if (!order) return res.status(404).json({ message: 'Order not found.' })
  res.json({ order })
})

// ── PUT /api/orders/:id/status (admin) ────────────────────────
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, note } = req.body

  const validStatuses = ['pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' })
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email')
  if (!order) return res.status(404).json({ message: 'Order not found.' })

  order.status = status
  if (trackingNumber) order.trackingNumber = trackingNumber
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` })
  await order.save()

  // Send status email to customer
  sendOrderStatusEmail({
    name: order.user.name,
    email: order.user.email,
    orderNumber: order.orderNumber,
    status,
    trackingNumber,
  }).catch(console.error)

  res.json({ order })
})

// ── GET /api/orders (admin — all orders) ──────────────────────
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const filter = status ? { status } : {}
  const total = await Order.countDocuments(filter)
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))

  res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
})

module.exports = { createOrder, verifyPayment, getOrders, getOrder, updateOrderStatus, getAllOrders }
