require('dotenv').config()
require('dns').setServers(['8.8.8.8', '8.8.4.4'])
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Elvarra API running on port ${PORT}`)
    console.log(`   Mode:     ${process.env.NODE_ENV || 'development'}`)
    console.log(`   URL:      http://localhost:${PORT}`)
    console.log(`   Health:   http://localhost:${PORT}/health\n`)
  })

  // ── Graceful shutdown ─────────────────────────────────────
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully…`)
    server.close(() => {
      console.log('✅ HTTP server closed')
      process.exit(0)
    })
    setTimeout(() => {
      console.error('❌ Force shutdown after timeout')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  // ── Unhandled rejections ──────────────────────────────────
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err.message)
    server.close(() => process.exit(1))
  })

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message)
    process.exit(1)
  })
}

startServer()
