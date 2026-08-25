const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    })

    console.log(`✅ MongoDB connected: ${conn.connection.host}`)

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Reconnecting...')
    })
  } catch (error) {
    console.error('\n❌ MongoDB connection failed:', error.message)
    if (error.message.includes('whitelist') || error.message.includes('SSL') || error.name === 'MongooseServerSelectionError') {
      console.error('👉 TIP: Make sure your current IP address is whitelisted in MongoDB Atlas: Network Access > Add IP Address > Allow Access from Anywhere (0.0.0.0/0)\n')
    }
  }
}

module.exports = connectDB

