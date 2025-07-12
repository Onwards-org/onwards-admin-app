import express from 'express'
import { UCLALonelinessScaleModel, type UCLASubmission } from '../models/UCLALonelinessScale.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import PDFDocument from 'pdfkit'

const router = express.Router()

// Submit UCLA Loneliness Scale form (public endpoint)
router.post('/submit', async (req, res) => {
  try {
    const { name, isolated, leftOut, lackCompanionship } = req.body
    
    if (!name || !isolated || !leftOut || !lackCompanionship) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    
    // Validate response values
    const validResponses = ['hardly_ever', 'some_of_the_time', 'often']
    if (!validResponses.includes(isolated) || !validResponses.includes(leftOut) || !validResponses.includes(lackCompanionship)) {
      return res.status(400).json({ error: 'Invalid response values' })
    }
    
    const submission: UCLASubmission = {
      name: name.trim(),
      isolated_response: isolated,
      left_out_response: leftOut,
      lack_companionship_response: lackCompanionship
    }
    
    const result = await UCLALonelinessScaleModel.submit(submission)
    
    res.json({
      message: 'UCLA Loneliness Scale submission recorded successfully',
      submission: result
    })
  } catch (error) {
    console.error('UCLA submission error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get monthly report data (requires auth)
router.get('/report/:year/:month', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { year, month } = req.params
    
    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month' })
    }
    
    const report = await UCLALonelinessScaleModel.generateMonthlyReport(monthNum, yearNum)
    res.json(report)
  } catch (error) {
    console.error('Generate UCLA report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Generate PDF report (requires auth)
router.get('/report/:year/:month/pdf', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { year, month } = req.params
    
    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month' })
    }
    
    const report = await UCLALonelinessScaleModel.generateMonthlyReport(monthNum, yearNum)
    
    const doc = new PDFDocument({ size: 'A4', margin: 40 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="ucla-loneliness-scale-report-${year}-${month.toString().padStart(2, '0')}.pdf"`)
    
    doc.pipe(res)
    
    // Title page with white background and purple/gold border
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('white')
    
    // Create solid purple border
    const borderWidth = 15
    const purpleColor = '#8b5cf6'
    
    // Top border
    doc.rect(0, 0, doc.page.width, borderWidth).fill(purpleColor)
    
    // Bottom border
    doc.rect(0, doc.page.height - borderWidth, doc.page.width, borderWidth).fill(purpleColor)
    
    // Left border
    doc.rect(0, 0, borderWidth, doc.page.height).fill(purpleColor)
    
    // Right border
    doc.rect(doc.page.width - borderWidth, 0, borderWidth, doc.page.height).fill(purpleColor)
    
    // Title text
    doc.fillColor('black')
    doc.fontSize(32).text('Onwards UCLA', 40, 200, { align: 'center' })
    doc.fontSize(28).text('Loneliness Scale Report', 40, 250, { align: 'center' })
    doc.fontSize(20).text(`${new Date(yearNum, monthNum - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`, 40, 320, { align: 'center' })
    
    // Add summary info
    const totalSubmissions = report.stats.total_submissions
    doc.fontSize(16).text(`Total Submissions: ${totalSubmissions}`, 40, 380, { align: 'center' })
    
    
    // Helper function to create page header
    const createHeader = (title: string) => {
      doc.rect(0, 0, doc.page.width, 80).fill('#7c3aed')
      doc.fillColor('white')
      doc.fontSize(24).text('Onwards UCLA Loneliness Scale Report', 40, 25, { align: 'center' })
      doc.fontSize(14).text(title, 40, 55, { align: 'center' })
      doc.fillColor('black')
    }

    // Helper function to draw pie chart
    const drawPieChart = (data: Record<string, number>, title: string, colors: string[]) => {
      const centerX = 300
      const centerY = 300
      const radius = 120
      const total = Object.values(data).reduce((a, b) => a + b, 0)
      
      if (total === 0) {
        doc.fontSize(16).text('No data available for this period', 40, 300, { align: 'center' })
        return
      }
      
      doc.fontSize(18).text(title, 60, 120, { align: 'center', width: 480 })
      
      let currentAngle = -Math.PI / 2
      const entries = Object.entries(data)
      
      entries.forEach(([label, value], index) => {
        const sliceAngle = (value / total) * 2 * Math.PI
        const color = colors[index % colors.length]
        
        // Draw slice
        doc.save()
        doc.path(`M ${centerX} ${centerY}`)
        doc.lineTo(centerX + radius * Math.cos(currentAngle), centerY + radius * Math.sin(currentAngle))
        doc.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
        doc.lineTo(centerX, centerY)
        doc.closePath()
        doc.fillColor(color).fill()
        doc.restore()
        
        // Draw percentage
        const midAngle = currentAngle + sliceAngle / 2
        const textX = centerX + (radius * 0.6) * Math.cos(midAngle)
        const textY = centerY + (radius * 0.6) * Math.sin(midAngle)
        const percentage = ((value / total) * 100).toFixed(1)
        
        doc.fillColor('white').fontSize(10)
        doc.text(`${percentage}%`, textX - 15, textY - 5, { width: 30, align: 'center' })
        
        currentAngle += sliceAngle
      })
      
      // Legend with formatted labels
      const legendX = 50
      const legendY = 450
      entries.forEach(([label, value], index) => {
        const color = colors[index % colors.length]
        const legendItemY = legendY + index * 20
        
        // Format label for display
        const displayLabel = label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        
        doc.rect(legendX, legendItemY, 15, 15).fillColor(color).fill()
        doc.fillColor('black').fontSize(10)
        doc.text(`${displayLabel}: ${value}`, legendX + 25, legendItemY + 3)
      })
    }

    // High contrast color palettes
    const colorPalettes = {
      blue: ['#1e40af', '#dc2626', '#059669'],
      green: ['#059669', '#dc2626', '#1e40af'], 
      purple: ['#7c3aed', '#dc2626', '#059669']
    }

    const sections = [
      { title: 'How often do you feel isolated from others?', data: report.stats.isolated_responses, colors: colorPalettes.blue },
      { title: 'How often do you feel left out?', data: report.stats.left_out_responses, colors: colorPalettes.green },
      { title: 'How often do you feel that you lack companionship?', data: report.stats.lack_companionship_responses, colors: colorPalettes.purple }
    ]
    
    sections.forEach(section => {
      doc.addPage()
      createHeader(section.title)
      drawPieChart(section.data, section.title, section.colors)
    })
    
    doc.end()
  } catch (error) {
    console.error('Generate UCLA PDF report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all submissions (requires auth)
router.get('/submissions', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { start_date, end_date } = req.query
    
    let startDate: Date | undefined
    let endDate: Date | undefined
    
    if (start_date) {
      startDate = new Date(start_date as string)
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ error: 'Invalid start date format' })
      }
    }
    
    if (end_date) {
      endDate = new Date(end_date as string)
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid end date format' })
      }
    }
    
    const submissions = await UCLALonelinessScaleModel.getSubmissions(startDate, endDate)
    res.json({ submissions })
  } catch (error) {
    console.error('Get UCLA submissions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router