import express from 'express'
import { AttendanceModel } from '../models/Attendance.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import PDFDocument from 'pdfkit'

const router = express.Router()

router.post('/record', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { member_id, date, present = true } = req.body
    
    if (!member_id || !date) {
      return res.status(400).json({ error: 'Member ID and date are required' })
    }
    
    const attendanceDate = new Date(date)
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }
    
    const attendance = await AttendanceModel.record(member_id, attendanceDate, present)
    
    res.json({
      message: 'Attendance recorded successfully',
      attendance
    })
  } catch (error) {
    console.error('Record attendance error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/record-bulk', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { date, attendance_records } = req.body
    
    if (!date || !Array.isArray(attendance_records)) {
      return res.status(400).json({ error: 'Date and attendance records array are required' })
    }
    
    const attendanceDate = new Date(date)
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }
    
    const results = []
    for (const record of attendance_records) {
      const { member_id, present } = record
      if (member_id) {
        const attendance = await AttendanceModel.record(member_id, attendanceDate, present)
        results.push(attendance)
      }
    }
    
    res.json({
      message: 'Bulk attendance recorded successfully',
      records: results
    })
  } catch (error) {
    console.error('Bulk record attendance error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/date/:date', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { date } = req.params
    
    const attendanceDate = new Date(date)
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }
    
    const attendance = await AttendanceModel.getByDate(attendanceDate)
    res.json(attendance)
  } catch (error) {
    console.error('Get attendance by date error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/members-for-date/:date', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { date } = req.params
    
    const attendanceDate = new Date(date)
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }
    
    const members = await AttendanceModel.getMembersForDate(attendanceDate)
    res.json(members)
  } catch (error) {
    console.error('Get members for date error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/member/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const { start_date, end_date } = req.query
    
    const memberId = parseInt(id)
    if (isNaN(memberId)) {
      return res.status(400).json({ error: 'Invalid member ID' })
    }
    
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
    
    const attendance = await AttendanceModel.getByMember(memberId, startDate, endDate)
    res.json(attendance)
  } catch (error) {
    console.error('Get member attendance error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/report/:year/:month', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { year, month } = req.params
    
    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month' })
    }
    
    const report = await AttendanceModel.generateMonthlyReport(monthNum, yearNum)
    res.json(report)
  } catch (error) {
    console.error('Generate report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/report/:year/:month/pdf', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { year, month } = req.params
    
    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month' })
    }
    
    const report = await AttendanceModel.generateMonthlyReport(monthNum, yearNum)
    
    const doc = new PDFDocument({ size: 'A4', margin: 40 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="onwards-report-${year}-${month.toString().padStart(2, '0')}.pdf"`)
    
    doc.pipe(res)
    
    // Title page with white background and purple/gold border
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('white')
    
    // Create alternating purple and gold border
    const borderWidth = 15
    const colors = ['#8b5cf6', '#fbbf24', '#8b5cf6', '#fbbf24', '#8b5cf6', '#fbbf24', '#8b5cf6']
    
    // Top border
    for (let i = 0; i < colors.length; i++) {
      const segmentWidth = doc.page.width / colors.length
      doc.rect(i * segmentWidth, 0, segmentWidth, borderWidth).fill(colors[i])
    }
    
    // Bottom border
    for (let i = 0; i < colors.length; i++) {
      const segmentWidth = doc.page.width / colors.length
      doc.rect(i * segmentWidth, doc.page.height - borderWidth, segmentWidth, borderWidth).fill(colors[i])
    }
    
    // Left border
    for (let i = 0; i < colors.length; i++) {
      const segmentHeight = doc.page.height / colors.length
      doc.rect(0, i * segmentHeight, borderWidth, segmentHeight).fill(colors[i])
    }
    
    // Right border
    for (let i = 0; i < colors.length; i++) {
      const segmentHeight = doc.page.height / colors.length
      doc.rect(doc.page.width - borderWidth, i * segmentHeight, borderWidth, segmentHeight).fill(colors[i])
    }
    
    // Title text
    doc.fillColor('black')
    doc.fontSize(32).text('Onwards Monthly', 40, 200, { align: 'center' })
    doc.fontSize(28).text('Demographic Report', 40, 250, { align: 'center' })
    doc.fontSize(20).text(`${new Date(yearNum, monthNum - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`, 40, 320, { align: 'center' })
    
    // Add summary info
    const totalMembers = Object.values(report.stats.genders).reduce((a, b) => a + b, 0)
    doc.fontSize(16).text(`Total Members: ${totalMembers}`, 40, 380, { align: 'center' })
    
    const categories = [
      'Gender Distribution',
      'Age Groups', 
      'Ethnicity',
      'Medical Conditions',
      'Sexual Orientation',
      'Employment Status',
      'Geographic Location'
    ]
    
    doc.fontSize(14).text('Report Categories:', 40, 430, { align: 'center' })
    categories.forEach((category, index) => {
      doc.text(`• ${category}`, 40, 460 + index * 20, { align: 'center' })
    })
    
    // Helper function to create page header
    const createHeader = (title: string) => {
      doc.rect(0, 0, doc.page.width, 80).fill('#2563eb')
      doc.fillColor('white')
      doc.fontSize(24).text('Onwards Monthly Demographic Report', 40, 25, { align: 'center' })
      doc.fontSize(14).text(title, 40, 55, { align: 'center' })
      doc.fillColor('black')
    }

    // Helper function to draw simple pie chart
    const drawPieChart = (data: Record<string, number>, title: string, colors: string[]) => {
      const centerX = 300
      const centerY = 300
      const radius = 120
      const total = Object.values(data).reduce((a, b) => a + b, 0)
      
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
      
      // Legend
      const legendX = 50
      const legendY = 450
      entries.forEach(([label, value], index) => {
        const color = colors[index % colors.length]
        const legendItemY = legendY + index * 20
        
        doc.rect(legendX, legendItemY, 15, 15).fillColor(color).fill()
        doc.fillColor('black').fontSize(10)
        doc.text(`${label}: ${value}`, legendX + 25, legendItemY + 3)
      })
    }

    // Helper function to draw vertical bar chart
    const drawVerticalBarChart = (data: Record<string, number>, title: string, colors: string[], rotateLabels = false) => {
      const chartX = 80
      const chartY = 180  // Moved down from 150 to 180
      const chartWidth = 400
      const chartHeight = 250  // Reduced height to accommodate moved position
      const maxValue = Math.max(...Object.values(data))
      const barWidth = chartWidth / Object.keys(data).length
      
      doc.fontSize(18).text(title, 60, 120, { align: 'center', width: 480 })
      
      Object.entries(data).forEach(([label, value], index) => {
        const barHeight = (value / maxValue) * chartHeight
        const barX = chartX + index * barWidth + 10
        const barY = chartY + chartHeight - barHeight
        
        const color = colors[index % colors.length]
        doc.rect(barX, barY, barWidth - 20, barHeight).fill(color)
        
        doc.fillColor('black').fontSize(10)
        doc.text(value.toString(), barX, barY - 15, { width: barWidth - 20, align: 'center' })
        
        // Position labels at bottom of chart
        const bottomOfChart = chartY + chartHeight
        doc.fillColor('black').fontSize(9)
        doc.text(label, barX, bottomOfChart + 10, { width: barWidth - 20, align: 'center' })
      })
    }

    // Helper function to draw horizontal bar chart
    const drawHorizontalBarChart = (data: Record<string, number>, title: string, colors: string[]) => {
      const chartX = 150  // Leave space for labels on left
      const chartY = 180
      const chartWidth = 350
      const chartHeight = 250
      const maxValue = Math.max(...Object.values(data))
      const barHeight = chartHeight / Object.keys(data).length
      
      doc.fontSize(18).text(title, 60, 120, { align: 'center', width: 480 })
      
      Object.entries(data).forEach(([label, value], index) => {
        const barWidth = (value / maxValue) * chartWidth
        const barX = chartX
        const barY = chartY + index * barHeight + 5
        
        const color = colors[index % colors.length]
        doc.rect(barX, barY, barWidth, barHeight - 10).fill(color)
        
        // Value label at end of bar
        doc.fillColor('black').fontSize(10)
        doc.text(value.toString(), barX + barWidth + 5, barY + (barHeight - 10) / 2 - 5)
        
        // Category label on left side
        doc.fontSize(9)
        doc.text(label, 20, barY + (barHeight - 10) / 2 - 4, { width: 120, align: 'right' })
      })
    }

    // Helper function to sort age groups
    const sortAgeGroups = (ageGroupData: Record<string, number>) => {
      const ageOrder = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
      const sorted: Record<string, number> = {}
      ageOrder.forEach(age => {
        if (ageGroupData[age]) {
          sorted[age] = ageGroupData[age]
        }
      })
      return sorted
    }

    // High contrast color palettes
    const colorPalettes = {
      blue: ['#1e40af', '#dc2626', '#059669', '#d97706', '#7c3aed'],
      green: ['#059669', '#dc2626', '#1e40af', '#d97706', '#7c3aed'],
      purple: ['#7c3aed', '#dc2626', '#059669', '#d97706', '#1e40af'],
      orange: ['#d97706', '#dc2626', '#059669', '#1e40af', '#7c3aed'],
      red: ['#dc2626', '#059669', '#1e40af', '#d97706', '#7c3aed'],
      teal: ['#0891b2', '#dc2626', '#059669', '#d97706', '#7c3aed']
    }

    const sections = [
      { title: 'Gender Distribution', data: report.stats.genders, type: 'pie', colors: colorPalettes.blue },
      { title: 'Age Groups', data: sortAgeGroups(report.stats.age_groups), type: 'vertical', colors: colorPalettes.green, rotateLabels: false },
      { title: 'Sexual Orientation', data: report.stats.sexual_orientations, type: 'pie', colors: colorPalettes.red },
      { title: 'Employment Status', data: report.stats.employment_status, type: 'pie', colors: colorPalettes.orange },
      { title: 'Medical Conditions', data: report.stats.disabilities, type: 'horizontal', colors: colorPalettes.purple },
      { title: 'Geographic Location', data: report.stats.locations || {}, type: 'pie', colors: colorPalettes.teal }
    ]
    
    sections.forEach(section => {
      if (Object.keys(section.data).length > 0) {
        doc.addPage()
        createHeader(section.title)
        
        if (section.type === 'pie') {
          drawPieChart(section.data, section.title, section.colors)
        } else if (section.type === 'horizontal') {
          drawHorizontalBarChart(section.data, section.title, section.colors)
        } else {
          drawVerticalBarChart(section.data, section.title, section.colors, section.rotateLabels)
        }
      }
    })
    
    doc.end()
  } catch (error) {
    console.error('Generate PDF report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/stats', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // Get current date info
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    // Get weekly attendance (this week)
    const weeklyAttendance = await AttendanceModel.getAttendanceCount(startOfWeek, now)
    
    // Get monthly attendance (this month)
    const monthlyAttendance = await AttendanceModel.getAttendanceCount(startOfMonth, now)
    
    // Get new members (registered this month)
    const newMembers = await AttendanceModel.getNewMembersCount(startOfMonth, now)
    
    res.json({
      weeklyAttendance,
      monthlyAttendance,
      newMembers
    })
  } catch (error) {
    console.error('Get attendance stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router