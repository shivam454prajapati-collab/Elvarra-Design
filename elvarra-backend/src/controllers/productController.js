const Product = require('../models/Product')
const { asyncHandler } = require('../middleware/errorHandler')

// ── GET /api/products ──────────────────────────────────────────
// Query params: category, sort, search, page, limit
const getProducts = asyncHandler(async (req, res) => {
  const { category, sort, search, page = 1, limit = 12 } = req.query

  const filter = { isActive: true }

  if (category && category !== 'all') {
    filter.category = category
  }

  if (search) {
    filter.$text = { $search: search }
  }

  const sortOptions = {
    'asc': { price: 1 },
    'desc': { price: -1 },
    'newest': { createdAt: -1 },
    'popular': { soldCount: -1 },
    'featured': { createdAt: -1 },
  }
  const sortQuery = sortOptions[sort] || sortOptions.featured

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const total = await Product.countDocuments(filter)

  const products = await Product.find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(parseInt(limit))

  res.json({
    products,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  })
})

// ── GET /api/products/:id ──────────────────────────────────────
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isActive: true,
  })

  if (!product) {
    return res.status(404).json({ message: 'Product not found.' })
  }

  res.json({ product })
})

// ── POST /api/products (admin) ────────────────────────────────
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, colors, sizes, images, badge, stock } = req.body

  // Auto-generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const product = await Product.create({
    name, slug, description, price, category, colors, sizes, images, badge, stock,
  })

  res.status(201).json({ product })
})

// ── PUT /api/products/:id (admin) ─────────────────────────────
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!product) return res.status(404).json({ message: 'Product not found.' })

  res.json({ product })
})

// ── DELETE /api/products/:id (admin) ─────────────────────────
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!product) return res.status(404).json({ message: 'Product not found.' })

  res.json({ message: 'Product removed.' })
})

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct }
