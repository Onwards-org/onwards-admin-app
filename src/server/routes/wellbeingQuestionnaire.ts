import express from 'express'
import PDFDocument from 'pdfkit'
import { WellbeingIndexModel } from '../models/WellbeingIndex.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import * as v from 'valibot'

const router = express.Router()

const WellbeingQuestionnaireSchema = v.object({
  full_name: v.string([v.minLength(2, 'Full name must be at least 2 characters')]),
  responses: v.record(v.string(), v.number([v.minValue(1), v.maxValue(6)]))
})

// Public route for form submission
router.post('/submit', async (req, res) => {
  try {
    const data = v.parse(WellbeingQuestionnaireSchema, req.body)
    
    // Validate that all required questions are answered (4 questions total)
    const requiredQuestions = [
      // Wellbeing Questions only
      'happy_content', 'calm_relaxed', 'active_vigorous', 'daily_interest'
    ]
    
    const missingQuestions = requiredQuestions.filter(q => !(q in data.responses))
    if (missingQuestions.length > 0) {
      return res.status(400).json({ 
        error: `Missing responses for required questions: ${missingQuestions.join(', ')}` 
      })
    }
    
    const submission = await WellbeingIndexModel.create(data)
    
    res.status(201).json({
      message: 'Wellbeing questionnaire submitted successfully',
      submission: { 
        id: submission.id, 
        full_name: submission.full_name,
        wellbeing_score: submission.purpose_score
      }
    })
  } catch (error) {
    console.error('Wellbeing questionnaire submission error:', error)
    
    if (error instanceof v.ValiError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({
          field: issue.path?.map(p => p.key).join('.'),
          message: issue.message
        }))
      })
    }
    
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin routes (require authentication)
router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit
    
    const submissions = await WellbeingIndexModel.list(limit, offset)
    const total = await WellbeingIndexModel.count()
    
    res.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('List wellbeing submissions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const submissionId = parseInt(id)
    
    if (isNaN(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' })
    }
    
    const submission = await WellbeingIndexModel.findById(submissionId)
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }
    
    res.json(submission)
  } catch (error) {
    console.error('Get wellbeing submission error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const submissionId = parseInt(id)
    
    if (isNaN(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' })
    }
    
    const submission = await WellbeingIndexModel.findById(submissionId)
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }
    
    await WellbeingIndexModel.delete(submissionId)
    res.json({ message: 'Wellbeing submission deleted successfully' })
  } catch (error) {
    console.error('Delete wellbeing submission error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PDF Report Generation
router.get('/report/:year/:month/pdf', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const year = parseInt(req.params.year)
    const month = parseInt(req.params.month)
    
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' })
    }
    
    const reportData = await WellbeingIndexModel.generateMonthlyReport(year, month)
    
    // Create PDF
    const doc = new PDFDocument({ margin: 50 })
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="wellbeing-report-${year}-${month.toString().padStart(2, '0')}.pdf"`)
    
    // Pipe PDF to response
    doc.pipe(res)
    
    // PDF Header with custom purple theme
    doc.fillColor('#a672b0')
       .fontSize(24)
       .text('ONWARDS', 50, 50)
       .fontSize(18)
       .fillColor('#333')
       .text(`Wellbeing Index Report - ${getMonthName(month)} ${year}`, 50, 80)
    
    // Executive Summary
    let yPos = 130
    doc.fontSize(16)
       .fillColor('#a672b0')
       .text('Executive Summary', 50, yPos)
    
    yPos += 30
    doc.fontSize(12)
       .fillColor('#333')
       .text(`Total Responses: ${reportData.totalResponses}`, 50, yPos)
    
    yPos += 20
    doc.text(`Average Wellbeing Score: ${reportData.avgPurposeScore}/24 (${Math.round((reportData.avgPurposeScore / 24) * 100)}%)`, 50, yPos)
    
    // Wellbeing Score Distribution
    yPos += 50
    doc.fontSize(16)
       .fillColor('#a672b0')
       .text('Wellbeing Score Distribution', 50, yPos)
    
    yPos += 25
    if (Object.keys(reportData.purposeScoreDistribution).length > 0) {
      drawVerticalBarChart(doc, 50, yPos, 400, 150, reportData.purposeScoreDistribution, '')
    } else {
      doc.fontSize(12)
         .fillColor('#666')
         .text('No purpose score data available', 70, yPos)
    }
    
    // Footer
    const footerY = doc.page.height - 50
    doc.fontSize(10)
       .fillColor('#666')
       .text(`Generated on ${new Date().toLocaleDateString('en-GB')} | Onwards Wellbeing Index Report`, 50, footerY)
    
    doc.end()
    
  } catch (error) {
    console.error('Generate wellbeing report error:', error)
    res.status(500).json({ error: 'Failed to generate report' })
  }
})

// Helper functions for PDF charts
function drawPieChart(doc: PDFDocument, x: number, y: number, radius: number, data: Record<string, number>, title: string) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0)
  if (total === 0) return
  
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']
  let currentAngle = 0
  let colorIndex = 0
  
  // Draw pie slices
  Object.entries(data).forEach(([label, value]) => {
    const sliceAngle = (value / total) * 2 * Math.PI
    const color = colors[colorIndex % colors.length]
    
    doc.save()
       .fillColor(color)
    
    // Draw slice using path
    doc.path(`M ${x} ${y}`)
       .arc(x, y, radius, currentAngle, currentAngle + sliceAngle)
       .lineTo(x, y)
       .fill()
    
    doc.restore()
    
    currentAngle += sliceAngle
    colorIndex++
  })
  
  // Draw legend
  let legendY = y + radius + 20
  colorIndex = 0
  Object.entries(data).forEach(([label, value]) => {
    const color = colors[colorIndex % colors.length]
    const percentage = ((value / total) * 100).toFixed(1)
    
    doc.rect(x - radius, legendY, 10, 10)
       .fillColor(color)
       .fill()
    
    doc.fontSize(10)
       .fillColor('#333')
       .text(`${label}: ${value} (${percentage}%)`, x - radius + 15, legendY + 1)
    
    legendY += 15
    colorIndex++
  })
}

function drawHorizontalBarChart(doc: PDFDocument, x: number, y: number, width: number, height: number, data: Record<string, number>, title: string) {
  const entries = Object.entries(data)
  if (entries.length === 0) return
  
  const maxValue = Math.max(...Object.values(data))
  const barHeight = Math.min(height / entries.length - 10, 30)
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']
  
  entries.forEach(([label, value], index) => {
    const barWidth = (value / maxValue) * width * 0.7
    const barY = y + (index * (barHeight + 10))
    const color = colors[index % colors.length]
    
    // Draw bar
    doc.rect(x + 120, barY, barWidth, barHeight)
       .fillColor(color)
       .fill()
    
    // Draw label
    doc.fontSize(9)
       .fillColor('#333')
       .text(label.length > 15 ? label.substring(0, 15) + '...' : label, x, barY + barHeight / 2 - 4, { width: 115, align: 'right' })
    
    // Draw value
    doc.text(value.toString(), x + 125 + barWidth, barY + barHeight / 2 - 4)
  })
}

function drawVerticalBarChart(doc: PDFDocument, x: number, y: number, width: number, height: number, data: Record<string, number>, title: string) {
  const entries = Object.entries(data)
  if (entries.length === 0) return
  
  const maxValue = Math.max(...Object.values(data))
  const barWidth = Math.min(width / entries.length - 10, 60)
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']
  
  entries.forEach(([label, value], index) => {
    const barHeight = (value / maxValue) * height * 0.8
    const barX = x + (index * (barWidth + 10))
    const barY = y + height - barHeight
    const color = colors[index % colors.length]
    
    // Draw bar
    doc.rect(barX, barY, barWidth, barHeight)
       .fillColor(color)
       .fill()
    
    // Draw value on top of bar
    doc.fontSize(9)
       .fillColor('#333')
       .text(value.toString(), barX + barWidth / 2 - 5, barY - 15)
    
    // Draw label below
    doc.save()
       .translate(barX + barWidth / 2, y + height + 10)
       .rotate(-45)
       .text(label.length > 12 ? label.substring(0, 12) + '...' : label, 0, 0)
       .restore()
  })
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || 'Unknown'
}

export default router