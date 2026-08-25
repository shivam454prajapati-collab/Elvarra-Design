require('dotenv').config()
require('dns').setServers(['8.8.8.8', '8.8.4.4'])
const mongoose = require('mongoose')
const Product = require('../models/Product')
const Coupon = require('../models/Coupon')
const User = require('../models/User')

const PRODUCTS = [
  {
    name: 'Classic Crew Tee',
    slug: 'classic-crew-tee',
    description: 'Premium 100% BCI cotton classic crew neck. Soft, breathable and built to last.',
    price: 699,
    category: 'crew-neck',
    colors: ['#FFFFFF', '#2C2C2C', '#C9A84C', '#1A3A5C'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80'],
    badge: 'Bestseller',
    stock: 100,
  },
  {
    name: 'Oversized Drop Shoulder',
    slug: 'oversized-drop-shoulder',
    description: 'Relaxed drop shoulder fit with premium GSM fabric. Street-ready comfort.',
    price: 899,
    category: 'oversized',
    colors: ['#F5F0E8', '#3A3A3A', '#8B4513', '#2F4F4F'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80'],
    badge: 'New',
    stock: 80,
  },
  {
    name: 'Polo Signature',
    slug: 'polo-signature',
    description: 'Classic polo collar with ribbed cuffs. Perfect for smart casual occasions.',
    price: 1099,
    category: 'polo',
    colors: ['#FFFFFF', '#1C1C1C', '#C9A84C', '#556B2F'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&q=80'],
    badge: null,
    stock: 60,
  },
  {
    name: 'Acid Wash Vintage',
    slug: 'acid-wash-vintage',
    description: 'Hand-crafted acid wash giving each piece a unique, vintage character.',
    price: 999,
    category: 'crew-neck',
    colors: ['#B0C4DE', '#DEB887', '#C0C0C0', '#F5DEB3'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500&q=80'],
    badge: 'Limited',
    stock: 30,
  },
  {
    name: 'V-Neck Essential',
    slug: 'v-neck-essential',
    description: 'A clean, minimal V-neck that pairs with everything. Timeless wardrobe staple.',
    price: 749,
    category: 'v-neck',
    colors: ['#FFFFFF', '#2C2C2C', '#8B0000', '#003153'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&q=80'],
    badge: null,
    stock: 90,
  },
  {
    name: 'Henley Long Sleeve',
    slug: 'henley-long-sleeve',
    description: 'Button placket henley in a relaxed long sleeve fit. Perfect for layering.',
    price: 1199,
    category: 'henley',
    colors: ['#F5F5DC', '#4A4A4A', '#8B6914', '#2E4057'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://images.unsplash.com/photo-1602810316693-3667c854239a?w=500&q=80'],
    badge: null,
    stock: 70,
  },
]

const COUPONS = [
  { code: 'ELVARRA10', type: 'percent', discount: 10, minOrderValue: 0, description: 'Welcome 10% off', usageLimit: 1000 },
  { code: 'FLAT100', type: 'flat', discount: 100, minOrderValue: 999, description: '₹100 off on orders above ₹999' },
  { code: 'NEWUSER', type: 'percent', discount: 15, minOrderValue: 0, maxDiscount: 200, description: 'New user 15% off (max ₹200)' },
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing
    await Product.deleteMany({})
    await Coupon.deleteMany({})
    console.log('🧹 Cleared existing products and coupons')

    // Seed products
    await Product.insertMany(PRODUCTS)
    console.log(`✅ Seeded ${PRODUCTS.length} products`)

    // Seed coupons
    await Coupon.insertMany(COUPONS)
    console.log(`✅ Seeded ${COUPONS.length} coupons`)

    // Create admin user if not exists
    const adminEmail = 'admin@elvarra.com'
    const existingAdmin = await User.findOne({ email: adminEmail })
    if (!existingAdmin) {
      await User.create({
        name: 'Elvarra Admin',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin',
      })
      console.log('✅ Admin user created: admin@elvarra.com / Admin@123')
    } else {
      console.log('ℹ️  Admin user already exists')
    }

    console.log('\n🎉 Seed complete!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  }
}

seed()
