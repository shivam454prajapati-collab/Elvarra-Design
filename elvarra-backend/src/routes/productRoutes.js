const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, uploadProductImage,
} = require('../controllers/productController')

// ── Public ────────────────────────────────────────────────────
router.get('/', getProducts)
router.get('/:id', getProduct)

// ── Admin only ────────────────────────────────────────────────
router.post('/upload-image', protect, adminOnly, upload.single('image'), uploadProductImage)
router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

module.exports = router

