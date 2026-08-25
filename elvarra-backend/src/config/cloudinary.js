const cloudinary = require('cloudinary').v2
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── Local disk storage (fallback when Cloudinary not configured) ──
// Files saved to /uploads/designs/ temporarily
const localUploadDir = path.join(__dirname, '../../uploads/designs')
if (!fs.existsSync(localUploadDir)) fs.mkdirSync(localUploadDir, { recursive: true })

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, localUploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})

// ── File filter ───────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/pdf']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only PNG, JPG, SVG, and PDF are allowed.'), false)
  }
}

// ── Multer instance ───────────────────────────────────────────
const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter,
})

// ── Upload to Cloudinary helper ───────────────────────────────
const uploadToCloudinary = async (filePath, folder = 'elvarra/designs') => {
  // 🔌 When CLOUDINARY env vars are set, this uploads to cloud
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    // Return local path as URL when Cloudinary not configured
    const filename = path.basename(filePath)
    return {
      secure_url: `/uploads/designs/${filename}`,
      public_id: filename,
    }
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
    use_filename: true,
    unique_filename: true,
  })

  // Delete local temp file after cloud upload
  fs.unlink(filePath, () => {})

  return result
}

module.exports = { upload, uploadToCloudinary, cloudinary }
