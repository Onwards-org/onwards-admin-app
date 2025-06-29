import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDatabase, createTables } from './models/database.js'
import authRoutes from './routes/auth.js'
import memberRoutes from './routes/members.js'
import attendanceRoutes from './routes/attendance.js'
import uclaRoutes from './routes/ucla-loneliness-scale.js'
import photoConsentRoutes from './routes/photoConsent.js'
import wellbeingQuestionnaireRoutes from './routes/wellbeingQuestionnaire.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/ucla-loneliness-scale', uclaRoutes)
app.use('/api/photo-consent', photoConsentRoutes)
app.use('/api/wellbeing-questionnaire', wellbeingQuestionnaireRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

// Serve static files from dist/client directory
const clientDistPath = path.join(__dirname, '../../dist/client')
app.use(express.static(clientDistPath))

// Handle SPA routing - serve index.html for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'))
  } else {
    res.status(404).json({ error: 'API endpoint not found' })
  }
})

const startServer = async () => {
  try {
    initDatabase()
    
    // Try to create tables, but don't fail if we don't have permissions
    try {
      await createTables()
      console.log('Database tables verified/created successfully')
    } catch (error) {
      console.warn('Could not create/verify tables (this is ok if tables already exist):', error.message)
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()