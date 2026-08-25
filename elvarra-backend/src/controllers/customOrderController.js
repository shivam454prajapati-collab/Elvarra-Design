const CustomOrder = require('../models/CustomOrder')
const { asyncHandler } = require('../middleware/errorHandler')
const { uploadToCloudinary } = require('../config/cloudinary')
const { sendCustomOrderEmail, sendCustomOrderAdminEmail } = require('../services/email')

// ── POST /api/custom-orders ────────────────────────────────────
// multipart/form-data (handled by multer in route)
const createCustomOrder = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Design file is required.' })
  }

  const { tshirtType, color, size, qty, printMethod, printArea, notes, name, email, phone } = req.body

  // Validate required fields
  if (!tshirtType || !size || !qty || !printMethod || !name || !email || !phone) {
    return res.status(400).json({ message: 'All required fields must be filled.' })
  }

  // Upload design file to Cloudinary (or keep local in dev)
  let designFileUrl, designFilePublicId
  try {
    const uploadResult = await uploadToCloudinary(req.file.path, 'elvarra/custom-designs')
    designFileUrl = uploadResult.secure_url
    designFilePublicId = uploadResult.public_id
  } catch (uploadErr) {
    console.error('File upload error:', uploadErr.message)
    return res.status(500).json({ message: 'Failed to upload design file. Please try again.' })
  }

  const customOrder = await CustomOrder.create({
    user: req.user?._id || null,
    tshirtType,
    color: color || '#FFFFFF',
    size,
    qty: parseInt(qty),
    printMethod,
    printArea: printArea || 'Front',
    designFileUrl,
    designFilePublicId,
    notes: notes || '',
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
  })

  // Send emails (non-blocking)
  sendCustomOrderEmail({ name, email, orderId: customOrder.orderId, tshirtType, qty: parseInt(qty) }).catch(console.error)
  sendCustomOrderAdminEmail({ orderId: customOrder.orderId, name, email, phone, tshirtType, qty: parseInt(qty), printMethod, designUrl: designFileUrl }).catch(console.error)

  res.status(201).json({
    customOrder: {
      id: customOrder.orderId,
      status: customOrder.status,
      estimatedPrice: null,
    },
  })
})

// ── GET /api/custom-orders (admin) ────────────────────────────
const getCustomOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const filter = status ? { status } : {}
  const total = await CustomOrder.countDocuments(filter)
  const orders = await CustomOrder.find(filter)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))

  res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
})

// ── PUT /api/custom-orders/:id (admin) ────────────────────────
const updateCustomOrder = asyncHandler(async (req, res) => {
  const { status, estimatedPrice, adminNotes } = req.body

  const order = await CustomOrder.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Custom order not found.' })

  if (status) order.status = status
  if (estimatedPrice !== undefined) order.estimatedPrice = estimatedPrice
  if (adminNotes !== undefined) order.adminNotes = adminNotes

  await order.save()
  res.json({ order })
})

module.exports = { createCustomOrder, getCustomOrders, updateCustomOrder }
