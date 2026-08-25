const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require('../controllers/productController')

// ── Public ────────────────────────────────────────────────────
router.get('/', getProducts)
router.get('/:id', getProduct)

// ── Admin only ────────────────────────────────────────────────
router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

module.exports = router
