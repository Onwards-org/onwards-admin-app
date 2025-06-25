import express from 'express'
import { AttendanceModel } from '../models/Attendance.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import PDFDocument from 'pdfkit'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

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
    
    const doc = new PDFDocument()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="onwards-report-${year}-${month.toString().padStart(2, '0')}.pdf"`)
    
    doc.pipe(res)
    
    doc.fontSize(20).text('Onwards Community Report', { align: 'center' })
    doc.fontSize(14).text(`${new Date(yearNum, monthNum - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`, { align: 'center' })
    doc.moveDown()
    
    const sections = [
      { title: 'Gender Distribution', data: report.stats.genders },
      { title: 'Age Groups', data: report.stats.age_groups },
      { title: 'Ethnicity', data: report.stats.ethnicities },
      { title: 'Medical Conditions', data: report.stats.disabilities },
      { title: 'Sexual Orientation', data: report.stats.sexual_orientations },
      { title: 'Employment Status', data: report.stats.employment_status },
      { title: 'Postcodes', data: report.stats.postcodes }
    ]
    
    sections.forEach(section => {
      if (Object.keys(section.data).length > 0) {
        doc.fontSize(16).text(section.title, { underline: true })
        doc.moveDown(0.5)
        
        Object.entries(section.data).forEach(([key, value]) => {
          doc.fontSize(12).text(`${key}: ${value}`)
        })
        
        doc.moveDown()
      }
    })
    
    doc.end()
  } catch (error) {
    console.error('Generate PDF report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router