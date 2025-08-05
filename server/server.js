// server.js
require('dotenv').config()
const express       = require('express')
const cors          = require('cors')
const helmet        = require('helmet')
const rateLimit     = require('express-rate-limit')
const connectDB     = require('./config/db')

// Route handlers
const authRoutes       = require('./routes/auth')
const questionRoutes   = require('./routes/questions')
const assignmentRoutes = require('./routes/assignments')
const submissionRoutes = require('./routes/submissions')
const uploadRoutes     = require('./routes/upload')
const userRoutes       = require('./routes/users')

// Auth middleware & error handler
const auth         = require('./middleware/auth')
const errorHandler = require('./middleware/errorHandler')

// Connect to database
connectDB()

const app = express()

// — Security & parsing middleware
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

// — Auth-specific rate limiter (200 requests / 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// — General rate limiter (100 requests / 15 min)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please slow down.' }
})
app.use(generalLimiter)

// — Public (no auth) routes
app.use('/api/auth', authRoutes)

// — Protected routes (JWT auth required)
app.use('/api/questions', auth, questionRoutes)
app.use('/api/assignments', auth, assignmentRoutes)
app.use('/api/assignments', auth, submissionRoutes)
app.use('/api/upload', auth, uploadRoutes)
app.use('/api/users', auth, userRoutes)

// — Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API running' })
})

// — Error handling
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`)
})
