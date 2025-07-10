import express from 'express'
import { AttendanceModel } from '../models/Attendance.js'
import { SessionModel } from '../models/Session.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import PDFDocument from 'pdfkit'

const router = express.Router()

// Helper function to process medical conditions data
const processedMedicalConditions = (data: Record<string, number>) => {
  const totals: Record<string, number> = {}
  const stacked: Record<string, Record<string, number>> = {}
  
  Object.entries(data).forEach(([condition, count]) => {
    const lowerCondition = condition.toLowerCase()
    
    // Check for autism variants
    if (lowerCondition.includes('autism')) {
      if (!totals['Autism']) totals['Autism'] = 0
      if (!stacked['Autism']) stacked['Autism'] = { 'diagnosed': 0, 'self diagnosed': 0, 'awaiting diagnosis': 0 }
      
      totals['Autism'] += count
      if (lowerCondition.includes('(diagnosed)')) stacked['Autism']['diagnosed'] += count
      else if (lowerCondition.includes('(self diagnosed)')) stacked['Autism']['self diagnosed'] += count
      else if (lowerCondition.includes('(awaiting diagnosis)')) stacked['Autism']['awaiting diagnosis'] += count
      else stacked['Autism']['diagnosed'] += count // default to diagnosed if no parentheses
    }
    // Check for ADHD variants
    else if (lowerCondition.includes('adhd')) {
      if (!totals['ADHD']) totals['ADHD'] = 0
      if (!stacked['ADHD']) stacked['ADHD'] = { 'diagnosed': 0, 'self diagnosed': 0, 'awaiting diagnosis': 0 }
      
      totals['ADHD'] += count
      if (lowerCondition.includes('(diagnosed)')) stacked['ADHD']['diagnosed'] += count
      else if (lowerCondition.includes('(self diagnosed)')) stacked['ADHD']['self diagnosed'] += count
      else if (lowerCondition.includes('(awaiting diagnosis)')) stacked['ADHD']['awaiting diagnosis'] += count
      else stacked['ADHD']['diagnosed'] += count
    }
    // Check for anxiety variants
    else if (lowerCondition.includes('anxiety')) {
      if (!totals['Anxiety']) totals['Anxiety'] = 0
      if (!stacked['Anxiety']) stacked['Anxiety'] = { 'diagnosed': 0, 'self diagnosed': 0, 'awaiting diagnosis': 0 }
      
      totals['Anxiety'] += count
      if (lowerCondition.includes('(diagnosed)')) stacked['Anxiety']['diagnosed'] += count
      else if (lowerCondition.includes('(self diagnosed)')) stacked['Anxiety']['self diagnosed'] += count
      else if (lowerCondition.includes('(awaiting diagnosis)')) stacked['Anxiety']['awaiting diagnosis'] += count
      else stacked['Anxiety']['diagnosed'] += count
    }
    // All other conditions
    else {
      // Remove diagnosis status from condition name for grouping
      let cleanCondition = condition.replace(/ \([^)]*\)$/, '')
      
      // Replace long condition names with abbreviations
      if (cleanCondition.toLowerCase().includes('obsessive compulsive disorder') || 
          cleanCondition.toLowerCase().includes('obsessive-compulsive disorder')) {
        cleanCondition = cleanCondition.replace(/obsessive[- ]compulsive disorder/gi, 'OCD')
      }
      if (cleanCondition.toLowerCase().includes('post traumatic stress disorder') || 
          cleanCondition.toLowerCase().includes('post-traumatic stress disorder')) {
        cleanCondition = cleanCondition.replace(/post[- ]traumatic stress disorder/gi, 'PTSD')
      }
      
      if (!totals[cleanCondition]) totals[cleanCondition] = 0
      totals[cleanCondition] += count
    }
  })
  
  return { totals, stacked }
}

// Helper function to draw horizontal compound bar chart for medical conditions
const drawMedicalConditionsChart = (data: Record<string, number>, title: string, colors: string[], doc: any) => {
  console.log('🔄 Drawing horizontal compound medical conditions chart')
  
  const chartX = 150  // Leave space for labels on left
  const chartY = 180
  const chartWidth = 350
  const chartHeight = 280
  
  doc.fontSize(18).text(title, 60, 120, { align: 'center', width: 480 })
  
  // Process medical conditions data
  const processedData = processedMedicalConditions(data)
  console.log('📊 Processed data for horizontal chart:', JSON.stringify(processedData, null, 2))
  
  // Check if we have any data to chart
  const totalKeys = Object.keys(processedData.totals)
  if (totalKeys.length === 0) {
    doc.fontSize(14).text('No medical conditions data available', 60, 200, { align: 'center', width: 480 })
    return
  }
  
  const maxValue = Math.max(...Object.values(processedData.totals))
  const barHeight = chartHeight / totalKeys.length
  
  Object.entries(processedData.totals).forEach(([condition, total], index) => {
    const barY = chartY + index * barHeight + 5
    const barBaseX = chartX
    
    if (processedData.stacked[condition]) {
      // Draw stacked bars for autism, ADHD, anxiety (horizontal)
      const stackData = processedData.stacked[condition]
      let currentX = barBaseX
      
      // Stack colors: diagnosed (dark), self-diagnosed (medium), awaiting (light)
      const stackColors = ['#1e40af', '#3b82f6', '#93c5fd']
      const stackOrder = ['diagnosed', 'self diagnosed', 'awaiting diagnosis']
      
      stackOrder.forEach((type, stackIndex) => {
        if (stackData[type] && stackData[type] > 0) {
          const segmentWidth = (stackData[type] / maxValue) * chartWidth
          
          doc.rect(currentX, barY, segmentWidth, barHeight - 10).fill(stackColors[stackIndex])
          
          // Add value label if segment is large enough
          if (segmentWidth > 25) {
            doc.fillColor('white').fontSize(8)
            doc.text(stackData[type].toString(), currentX + segmentWidth/2 - 5, barY + (barHeight - 10)/2 - 4, 
                    { width: segmentWidth, align: 'center' })
          }
          
          currentX += segmentWidth
        }
      })
      
      // Total value label at end of bar
      doc.fillColor('black').fontSize(10)
      doc.text(total.toString(), currentX + 5, barY + (barHeight - 10)/2 - 5)
    } else {
      // Draw simple bar for other conditions (horizontal)
      const barWidth = (total / maxValue) * chartWidth
      
      const color = colors[index % colors.length]
      doc.rect(barBaseX, barY, barWidth, barHeight - 10).fill(color)
      
      // Value label at end of bar
      doc.fillColor('black').fontSize(10)
      doc.text(total.toString(), barBaseX + barWidth + 5, barY + (barHeight - 10)/2 - 5)
    }
    
    // Condition label on left side
    doc.fillColor('black').fontSize(9)
    let labelText = condition
    // Better text wrapping for long condition names
    if (condition.length > 20) {
      labelText = condition.substring(0, 18) + '...'
    }
    doc.text(labelText, 20, barY + (barHeight - 10)/2 - 4, { width: 120, align: 'right' })
  })
  
  // Legend for stacked conditions
  const legendY = chartY + chartHeight + 40
  doc.fontSize(10).text('Legend for Autism/ADHD/Anxiety:', 80, legendY)
  
  const legendItems = [
    { label: 'Diagnosed', color: '#1e40af' },
    { label: 'Self-diagnosed', color: '#3b82f6' },
    { label: 'Awaiting diagnosis', color: '#93c5fd' }
  ]
  
  legendItems.forEach((item, index) => {
    const legendX = 80 + index * 120
    doc.rect(legendX, legendY + 15, 12, 12).fill(item.color)
    doc.fillColor('black').fontSize(9)
    doc.text(item.label, legendX + 20, legendY + 18)
  })
}

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
    const { date, attendance_records, cancelled, cancellation_notes } = req.body
    
    if (!date || !Array.isArray(attendance_records)) {
      return res.status(400).json({ error: 'Date and attendance records array are required' })
    }
    
    const attendanceDate = new Date(date)
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }
    
    // Handle session cancellation
    if (cancelled) {
      await SessionModel.cancelSession(
        attendanceDate, 
        cancellation_notes || 'No reason provided', 
        req.user?.username || 'Unknown'
      )
      
      // Delete any existing attendance records for cancelled sessions
      await AttendanceModel.deleteByDate(attendanceDate)
      
      return res.json({
        message: 'Session cancelled and all attendance records removed',
        records: []
      })
    }
    
    // Normal attendance recording
    const results = []
    for (const record of attendance_records) {
      const { member_id, present } = record
      if (member_id) {
        const attendance = await AttendanceModel.record(member_id, attendanceDate, present)
        results.push(attendance)
      }
    }
    
    // Mark session as held if there's any attendance
    const hasAttendance = results.some(r => r.present)
    if (hasAttendance) {
      await SessionModel.markAsHeld(attendanceDate)
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
    const { mode } = req.query
    
    const attendanceDate = new Date(date)
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }
    
    let session = await SessionModel.getByDate(attendanceDate)
    
    // If no session exists and we're in recording mode, create a scheduled one
    if (!session && mode === 'recording') {
      session = await SessionModel.create(attendanceDate, 'scheduled')
    }
    
    // Check if any attendance records exist for this date
    const { getPool } = await import('../models/database.js')
    const pool = getPool()
    const attendanceCheckQuery = 'SELECT COUNT(*) as count FROM attendance WHERE date = $1'
    const attendanceCheckResult = await pool.query(attendanceCheckQuery, [attendanceDate])
    const hasAttendanceRecords = parseInt(attendanceCheckResult.rows[0].count) > 0
    
    let members = []
    
    if (mode === 'recording') {
      // In recording mode, always show all members (for creating new records)
      members = await AttendanceModel.getMembersForDate(attendanceDate)
    } else {
      // In viewing mode, only show members if attendance records exist
      if (hasAttendanceRecords) {
        members = await AttendanceModel.getMembersForDate(attendanceDate)
      }
      // If no attendance records exist, members remains empty array
    }
    
    res.json({
      members,
      session,
      hasAttendanceRecords
    })
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
    doc.fontSize(32).text('Onwards Monthly', 40, 200, { align: 'center' })
    doc.fontSize(28).text('Demographic Report', 40, 250, { align: 'center' })
    doc.fontSize(20).text(`${new Date(yearNum, monthNum - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`, 40, 320, { align: 'center' })
    
    // Removed total members section as requested
    
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
      doc.rect(0, 0, doc.page.width, 80).fill('#8b5cf6')
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
        
        // Draw value instead of percentage
        const midAngle = currentAngle + sliceAngle / 2
        const textX = centerX + (radius * 0.6) * Math.cos(midAngle)
        const textY = centerY + (radius * 0.6) * Math.sin(midAngle)
        
        doc.fillColor('white').fontSize(10)
        doc.text(`${value}`, textX - 15, textY - 5, { width: 30, align: 'center' })
        
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
      // Add any additional age groups that weren't in the predefined order
      Object.keys(ageGroupData).forEach(age => {
        if (!ageOrder.includes(age)) {
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

    // Helper function to group heterosexual/straight together
    const groupSexualOrientations = (orientations: Record<string, number>) => {
      const grouped: Record<string, number> = {}
      let heterosexualCount = 0
      
      Object.entries(orientations).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase()
        if (lowerKey.includes('heterosexual') || lowerKey.includes('straight')) {
          heterosexualCount += value
        } else {
          grouped[key] = value
        }
      })
      
      if (heterosexualCount > 0) {
        grouped['Heterosexual'] = heterosexualCount
      }
      
      return grouped
    }

    // Helper function to sort employment status and handle empty values
    const sortEmploymentStatus = (employmentData: Record<string, number>) => {
      const sorted: Record<string, number> = {}
      const preferredOrder = ['Employed', 'Unemployed', 'Student', 'Retired', 'Self-employed']
      
      // Add items in preferred order
      preferredOrder.forEach(status => {
        if (employmentData[status]) {
          sorted[status] = employmentData[status]
        }
      })
      
      // Add remaining items (except other/prefer not to say)
      Object.keys(employmentData).forEach(status => {
        if (!preferredOrder.includes(status) && 
            !status.toLowerCase().includes('other') && 
            !status.toLowerCase().includes('prefer not to say') &&
            !status.toLowerCase().includes('unknown') &&
            status.trim() !== '') {
          sorted[status] = employmentData[status]
        }
      })
      
      // Handle empty/unknown values
      let unknownCount = 0
      if (employmentData['']) unknownCount += employmentData['']
      if (employmentData['Unknown']) unknownCount += employmentData['Unknown']
      if (employmentData['Not specified']) unknownCount += employmentData['Not specified']
      if (unknownCount > 0) {
        sorted['Not specified'] = unknownCount
      }
      
      // Add other and prefer not to say at the end
      Object.keys(employmentData).forEach(status => {
        if ((status.toLowerCase().includes('other') || 
             status.toLowerCase().includes('prefer not to say')) &&
            status.trim() !== '') {
          sorted[status] = employmentData[status]
        }
      })
      
      return sorted
    }

    // Helper function to sort any data putting 'other' and 'prefer not to say' at the bottom
    const sortWithOtherAtBottom = (data: Record<string, number>) => {
      const sorted: Record<string, number> = {}
      const otherKeys: string[] = []
      
      // First add all non-other/prefer not to say items
      Object.keys(data).forEach(key => {
        const lowerKey = key.toLowerCase()
        if (lowerKey.includes('other') || lowerKey.includes('prefer not to say')) {
          otherKeys.push(key)
        } else {
          sorted[key] = data[key]
        }
      })
      
      // Then add other/prefer not to say items at the end
      otherKeys.forEach(key => {
        sorted[key] = data[key]
      })
      
      return sorted
    }

    const sections = [
      { title: 'Gender Distribution', data: sortWithOtherAtBottom(report.stats.genders), type: 'pie', colors: colorPalettes.blue },
      { title: 'Age Groups', data: sortAgeGroups(report.stats.age_groups), type: 'vertical', colors: colorPalettes.green, rotateLabels: false },
      { title: 'Sexual Orientation', data: sortWithOtherAtBottom(groupSexualOrientations(report.stats.sexual_orientations)), type: 'pie', colors: colorPalettes.red },
      { title: 'Employment Status', data: sortEmploymentStatus(report.stats.employment_status), type: 'pie', colors: colorPalettes.orange },
      { title: 'Medical Conditions', data: sortWithOtherAtBottom(report.stats.disabilities), type: 'medical', colors: colorPalettes.purple },
      { title: 'Geographic Location', data: sortWithOtherAtBottom(report.stats.locations || {}), type: 'pie', colors: colorPalettes.teal }
    ]
    
    sections.forEach(section => {
      if (Object.keys(section.data).length > 0) {
        doc.addPage()
        createHeader(section.title)
        
        if (section.type === 'pie') {
          drawPieChart(section.data, section.title, section.colors)
        } else if (section.type === 'horizontal') {
          drawHorizontalBarChart(section.data, section.title, section.colors)
        } else if (section.type === 'medical') {
          try {
            drawMedicalConditionsChart(section.data, section.title, section.colors, doc)
          } catch (error) {
            console.error('❌ Error drawing medical conditions chart:', error)
            // Fallback to regular horizontal chart if compound chart fails
            drawHorizontalBarChart(section.data, section.title, section.colors)
          }
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

router.post('/remove-cancellation', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { date } = req.body
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' })
    }
    
    const sessionDate = new Date(date)
    if (isNaN(sessionDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }
    
    const session = await SessionModel.removeCancellation(sessionDate)
    
    res.json({
      message: 'Cancellation removed successfully',
      session
    })
  } catch (error) {
    console.error('Remove cancellation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router