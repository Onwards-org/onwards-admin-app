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
    
    // PAGE 1: TITLE PAGE
    doc.fillColor('#a672b0')
       .fontSize(36)
       .text('ONWARDS', 50, 150, { align: 'center' })
       .fontSize(24)
       .fillColor('#333')
       .text('Wellbeing Index Report', 50, 220, { align: 'center' })
       .fontSize(18)
       .text(`${getMonthName(month)} ${year}`, 50, 260, { align: 'center' })
    
    // Add report summary on title page
    doc.fontSize(14)
       .fillColor('#666')
       .text(`Total Responses: ${reportData.totalResponses}`, 50, 350, { align: 'center' })
       .text(`Average Wellbeing Score: ${reportData.avgWellbeingScore}/30`, 50, 380, { align: 'center' })
    
    // Footer on title page
    doc.fontSize(10)
       .fillColor('#999')
       .text(`Generated on ${new Date().toLocaleDateString('en-GB')}`, 50, 700, { align: 'center' })
    
    // PAGE 2: COMPARISON TO LAST MONTH
    doc.addPage()
    doc.fillColor('#a672b0')
       .fontSize(24)
       .text('Monthly Comparison', 50, 50)
    
    let yPos = 120
    doc.fontSize(16)
       .fillColor('#333')
       .text('Current Month Summary', 50, yPos)
    
    yPos += 30
    doc.fontSize(12)
       .text(`Total Responses: ${reportData.totalResponses}`, 70, yPos)
    yPos += 20
    doc.text(`Average Wellbeing Score: ${reportData.avgWellbeingScore}/30 (${Math.round((reportData.avgWellbeingScore / 30) * 100)}%)`, 70, yPos)
    
    yPos += 40
    if (reportData.previousMonthComparison) {
      doc.fontSize(16)
         .fillColor('#a672b0')
         .text('Comparison to Previous Month', 50, yPos)
      
      yPos += 30
      const avgDiff = reportData.previousMonthComparison.avgScoreDiff
      const responseDiff = reportData.previousMonthComparison.totalResponsesDiff
      
      doc.fontSize(12)
         .fillColor(avgDiff >= 0 ? '#10b981' : '#ef4444')
         .text(`Average Score Change: ${avgDiff >= 0 ? '+' : ''}${avgDiff} points`, 70, yPos)
      
      yPos += 20
      doc.fillColor(responseDiff >= 0 ? '#10b981' : '#ef4444')
         .text(`Response Count Change: ${responseDiff >= 0 ? '+' : ''}${responseDiff} responses`, 70, yPos)
      
      yPos += 30
      doc.fontSize(10)
         .fillColor('#666')
         .text(avgDiff > 0 ? '↗ Wellbeing scores improved compared to last month' : 
               avgDiff < 0 ? '↘ Wellbeing scores decreased compared to last month' : 
               '→ Wellbeing scores remained stable compared to last month', 70, yPos)
    } else {
      doc.fontSize(12)
         .fillColor('#666')
         .text('No previous month data available for comparison', 70, yPos)
    }
    
    // Overall wellbeing distribution chart
    yPos += 80
    doc.fontSize(16)
       .fillColor('#a672b0')
       .text('Overall Wellbeing Score Distribution', 50, yPos)
    
    yPos += 30
    if (Object.keys(reportData.wellbeingScoreDistribution).length > 0) {
      drawPieChart(doc, 300, yPos + 80, 80, reportData.wellbeingScoreDistribution, '')
    }
    
    // PAGES 3-7: PIE CHARTS FOR QUESTIONS 1-5
    const questionLabels = [
      'Happy and Content',
      'Calm and Relaxed', 
      'Active and Vigorous',
      'Fresh and Rested',
      'Daily Interest and Enthusiasm'
    ]
    
    questionLabels.forEach((questionLabel, index) => {
      doc.addPage()
      
      // Page header
      doc.fillColor('#a672b0')
         .fontSize(20)
         .text(`Question ${index + 1}: ${questionLabel}`, 50, 50)
      
      // Question description
      doc.fontSize(12)
         .fillColor('#666')
         .text('Response Distribution', 50, 90)
      
      // Draw pie chart for this question
      const questionData = reportData.questionBreakdowns[questionLabel]
      
      if (questionData && Object.values(questionData).some(v => v > 0)) {
        // Has data - draw chart
        drawPieChart(doc, 300, 250, 120, questionData, '')
        
        // Add summary stats
        const total = Object.values(questionData).reduce((sum, val) => sum + val, 0)
        const avgScore = Object.entries(questionData).reduce((sum, [label, count]) => {
          const scoreMap: Record<string, number> = {
            'None of the time': 1,
            'Some of the time': 2,
            'Less than half of the time': 3,
            'More than half of the time': 4,
            'Most of the time': 5,
            'All of the time': 6
          }
          return sum + (scoreMap[label] * count)
        }, 0) / total
        
        doc.fontSize(14)
           .fillColor('#333')
           .text(`Average Score: ${avgScore.toFixed(1)}/6`, 50, 530)
           .text(`Total Responses: ${total}`, 50, 555)
      } else {
        // No data - show message
        doc.fontSize(12)
           .fillColor('#666')
           .text(questionData ? 'No responses for this question yet' : 'Question data not found in report', 50, 200)
      }
    })
    
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
  
  const colors = ['#a672b0', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16']
  let currentAngle = -Math.PI / 2 // Start from top
  let colorIndex = 0
  
  // Draw pie slices using geometric approach
  Object.entries(data).forEach(([label, value]) => {
    if (value === 0) return
    
    const sliceAngle = (value / total) * 2 * Math.PI
    const color = colors[colorIndex % colors.length]
    
    doc.save()
    doc.fillColor(color)
    
    // Draw slice as a series of triangles for smoother arcs
    const steps = Math.max(8, Math.ceil(sliceAngle * 20)) // More steps for smoother curves
    const stepAngle = sliceAngle / steps
    
    for (let i = 0; i < steps; i++) {
      const angle1 = currentAngle + (i * stepAngle)
      const angle2 = currentAngle + ((i + 1) * stepAngle)
      
      const x1 = x + radius * Math.cos(angle1)
      const y1 = y + radius * Math.sin(angle1)
      const x2 = x + radius * Math.cos(angle2)
      const y2 = y + radius * Math.sin(angle2)
      
      // Draw triangle from center to arc segment
      doc.moveTo(x, y)
         .lineTo(x1, y1)
         .lineTo(x2, y2)
         .closePath()
         .fill()
    }
    
    doc.restore()
    
    currentAngle += sliceAngle
    colorIndex++
  })
  
  // Draw legend below the chart
  let legendY = y + radius + 30
  let legendX = x - radius
  colorIndex = 0
  
  Object.entries(data).forEach(([label, value]) => {
    if (value === 0) return
    
    const color = colors[colorIndex % colors.length]
    const percentage = ((value / total) * 100).toFixed(1)
    
    // Draw colored square
    doc.rect(legendX, legendY, 12, 12)
       .fillColor(color)
       .fill()
    
    // Draw text
    doc.fontSize(10)
       .fillColor('#333')
       .text(`${label}: ${value} (${percentage}%)`, legendX + 18, legendY + 2, { width: 200 })
    
    legendY += 18
    colorIndex++
  })
}

function drawHorizontalBarChart(doc: PDFDocument, x: number, y: number, width: number, height: number, data: Record<string, number>, title: string) {
  const entries = Object.entries(data)
  if (entries.length === 0) return
  
  const maxValue = Math.max(...Object.values(data))
  if (maxValue === 0) return
  
  const barHeight = Math.min(height / entries.length - 10, 30)
  const colors = ['#a672b0', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16']
  
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
  if (maxValue === 0) return
  
  const barWidth = Math.min(width / entries.length - 10, 60)
  const colors = ['#a672b0', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16']
  
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