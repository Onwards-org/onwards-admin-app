import express from 'express'
import { MemberModel } from '../models/Member.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import * as v from 'valibot'
import PDFDocument from 'pdfkit'
import {
  EMPLOYMENT_OPTIONS,
  ETHNICITY_OPTIONS,
  RELIGION_OPTIONS,
  GENDER_OPTIONS,
  SEXUAL_ORIENTATION_OPTIONS,
  TRANSGENDER_OPTIONS,
  PREGNANCY_OPTIONS,
  MEDICAL_CONDITIONS_OPTIONS,
  CHALLENGING_BEHAVIOURS_OPTIONS
} from '../../shared/types.js'

const router = express.Router()

const MemberSchema = v.object({
  name: v.string([v.minLength(2, 'Name must be at least 2 characters')]),
  phone: v.string([v.regex(/^(\+44|0)[1-9]\d{8,9}$/, 'Please enter a valid UK phone number')]),
  email: v.string([v.email('Please enter a valid email address')]),
  address: v.string([v.minLength(10, 'Please enter a complete address')]),
  postcode: v.optional(v.string()),
  birth_month: v.number([v.minValue(1), v.maxValue(12)]),
  birth_year: v.number([v.minValue(1900), v.maxValue(new Date().getFullYear())]),
  employment_status: v.picklist(EMPLOYMENT_OPTIONS as any),
  ethnicity: v.picklist(ETHNICITY_OPTIONS as any),
  religion: v.picklist(RELIGION_OPTIONS as any),
  gender: v.picklist(GENDER_OPTIONS as any),
  sexual_orientation: v.picklist(SEXUAL_ORIENTATION_OPTIONS as any),
  transgender_status: v.picklist(TRANSGENDER_OPTIONS as any),
  hobbies_interests: v.optional(v.string()),
  pregnancy_maternity: v.optional(v.picklist(PREGNANCY_OPTIONS as any)),
  additional_health_info: v.optional(v.string()),
  privacy_accepted: v.literal(true, 'You must accept the privacy statement'),
  emergency_contacts: v.array(v.object({
    name: v.string([v.minLength(2)]),
    phone: v.string([v.regex(/^(\+44|0)[1-9]\d{8,9}$/)])
  })),
  medical_conditions: v.optional(v.array(v.picklist(MEDICAL_CONDITIONS_OPTIONS as any))),
  challenging_behaviours: v.optional(v.array(v.picklist(CHALLENGING_BEHAVIOURS_OPTIONS as any)))
})

router.post('/register', async (req, res) => {
  try {
    const data = v.parse(MemberSchema, req.body)
    
    const existingMember = await MemberModel.findByEmail(data.email)
    if (existingMember) {
      return res.status(409).json({ error: 'A member with this email already exists' })
    }
    
    const {
      emergency_contacts,
      medical_conditions,
      challenging_behaviours,
      ...memberData
    } = data
    
    const member = await MemberModel.create(memberData)
    
    for (const contact of emergency_contacts) {
      await MemberModel.addEmergencyContact(member.id, contact)
    }
    
    if (medical_conditions) {
      for (const condition of medical_conditions) {
        await MemberModel.addMedicalCondition(member.id, condition)
      }
    }
    
    if (challenging_behaviours) {
      for (const behaviour of challenging_behaviours) {
        await MemberModel.addChallengingBehaviour(member.id, behaviour)
      }
    }
    
    res.status(201).json({
      message: 'Member registered successfully',
      member: { id: member.id, name: member.name, email: member.email }
    })
  } catch (error) {
    console.error('Member registration error:', error)
    
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

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit
    
    const members = await MemberModel.list(limit, offset)
    const total = await MemberModel.count()
    
    res.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('List members error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const memberId = parseInt(id)
    
    if (isNaN(memberId)) {
      return res.status(400).json({ error: 'Invalid member ID' })
    }
    
    const member = await MemberModel.findById(memberId)
    if (!member) {
      return res.status(404).json({ error: 'Member not found' })
    }
    
    const [emergencyContacts, medicalConditions, challengingBehaviours] = await Promise.all([
      MemberModel.getEmergencyContacts(memberId),
      MemberModel.getMedicalConditions(memberId),
      MemberModel.getChallengingBehaviours(memberId)
    ])
    
    res.json({
      ...member,
      emergency_contacts: emergencyContacts,
      medical_conditions: medicalConditions,
      challenging_behaviours: challengingBehaviours
    })
  } catch (error) {
    console.error('Get member error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const memberId = parseInt(id)
    
    if (isNaN(memberId)) {
      return res.status(400).json({ error: 'Invalid member ID' })
    }
    
    const member = await MemberModel.findById(memberId)
    if (!member) {
      return res.status(404).json({ error: 'Member not found' })
    }
    
    const UpdateSchema = v.partial(MemberSchema)
    const data = v.parse(UpdateSchema, req.body)
    
    const {
      emergency_contacts,
      medical_conditions,
      challenging_behaviours,
      ...memberData
    } = data
    
    const updatedMember = await MemberModel.update(memberId, memberData)
    
    res.json({
      message: 'Member updated successfully',
      member: updatedMember
    })
  } catch (error) {
    console.error('Update member error:', error)
    
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

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const memberId = parseInt(id)
    
    if (isNaN(memberId)) {
      return res.status(400).json({ error: 'Invalid member ID' })
    }
    
    const member = await MemberModel.findById(memberId)
    if (!member) {
      return res.status(404).json({ error: 'Member not found' })
    }
    
    await MemberModel.delete(memberId)
    res.json({ message: 'Member deleted successfully' })
  } catch (error) {
    console.error('Delete member error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper functions for PDF generation
function drawPieChart(doc: PDFDocument, x: number, y: number, radius: number, data: Record<string, number>, title: string) {
  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#84CC16']
  const total = Object.values(data).reduce((sum, value) => sum + value, 0)
  
  if (total === 0) {
    doc.fillColor('black').fontSize(12).text('No data available', x - 50, y)
    return
  }
  
  let currentAngle = 0
  const entries = Object.entries(data).filter(([label, value]) => value > 0)
  
  entries.forEach(([label, value], index) => {
    const sliceAngle = (value / total) * 2 * Math.PI
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    
    const color = colors[index % colors.length]
    
    // Draw pie slice using moveTo, lineTo, and arc
    doc.save()
    doc.fillColor(color)
    
    doc.moveTo(x, y)
    doc.lineTo(x + radius * Math.cos(startAngle), y + radius * Math.sin(startAngle))
    
    // Draw arc
    const steps = Math.max(8, Math.ceil(sliceAngle / (Math.PI / 4)))
    for (let i = 1; i <= steps; i++) {
      const angle = startAngle + (sliceAngle * i) / steps
      doc.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle))
    }
    
    doc.lineTo(x, y)
    doc.fill()
    doc.restore()
    
    currentAngle = endAngle
  })
  
  // Draw legend
  let legendY = y + radius + 20
  entries.forEach(([label, value], index) => {
    const color = colors[index % colors.length]
    doc.rect(x - radius, legendY, 10, 10).fillColor(color).fill()
    doc.fillColor('black').fontSize(10).text(`${label}: ${value} (${Math.round((value / total) * 100)}%)`, x - radius + 15, legendY + 1)
    legendY += 15
  })
}

function drawVerticalBarChart(doc: PDFDocument, x: number, y: number, width: number, height: number, data: Record<string, number>, title: string) {
  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#84CC16']
  const entries = Object.entries(data).filter(([label, value]) => value > 0)
  const maxValue = Math.max(...Object.values(data))
  
  if (maxValue === 0 || entries.length === 0) {
    doc.fillColor('black').fontSize(12).text('No data available', x, y)
    return
  }
  
  const barWidth = Math.min(60, (width - 40) / entries.length)
  const maxBarHeight = height - 60
  
  entries.forEach(([label, value], index) => {
    const barHeight = Math.max(5, (value / maxValue) * maxBarHeight)
    const barX = x + 20 + index * (barWidth + 10)
    const barY = y + height - barHeight - 40
    
    const color = colors[index % colors.length]
    doc.rect(barX, barY, barWidth, barHeight).fillColor(color).fill()
    
    // Value on top of bar
    doc.fillColor('black').fontSize(9).text(value.toString(), barX + barWidth / 2 - 5, barY - 12)
    
    // Label below bar (shortened if too long)
    const shortLabel = label.length > 8 ? label.substring(0, 8) + '...' : label
    doc.fontSize(8).text(shortLabel, barX, y + height - 30, { width: barWidth, align: 'center' })
  })
}

function drawHorizontalBarChart(doc: PDFDocument, x: number, y: number, width: number, height: number, data: Record<string, number>, title: string) {
  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#84CC16']
  const entries = Object.entries(data).filter(([label, value]) => value > 0)
  const maxValue = Math.max(...Object.values(data))
  
  if (maxValue === 0 || entries.length === 0) {
    doc.fillColor('black').fontSize(12).text('No data available', x, y)
    return
  }
  
  const barHeight = Math.min(30, (height - 20) / entries.length)
  const maxBarWidth = width - 180 // Leave space for labels
  
  entries.forEach(([label, value], index) => {
    const barWidth = Math.max(10, (value / maxValue) * maxBarWidth)
    const barX = x + 170
    const barY = y + 10 + index * (barHeight + 5)
    
    const color = colors[index % colors.length]
    doc.rect(barX, barY, barWidth, barHeight - 2).fillColor(color).fill()
    
    // Label on left (truncated if too long)
    const shortLabel = label.length > 20 ? label.substring(0, 20) + '...' : label
    doc.fillColor('black').fontSize(8).text(shortLabel, x, barY + barHeight / 2 - 4, { width: 160, align: 'right' })
    
    // Value on right of bar
    doc.fontSize(9).text(value.toString(), barX + barWidth + 5, barY + barHeight / 2 - 4)
  })
}

router.get('/report/:year/:month/pdf', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { year, month } = req.params
    
    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month' })
    }
    
    const report = await MemberModel.generateMonthlyReport(monthNum, yearNum)
    
    const doc = new PDFDocument({ size: 'A4', margin: 40 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="member-registration-report-${year}-${month.toString().padStart(2, '0')}.pdf"`)
    
    doc.pipe(res)
    
    // Cover page with custom purple styling
    doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#eecbf5').fill()
    
    // Purple header bar
    doc.rect(0, 0, doc.page.width, 80).fillColor('#a672b0').fill()
    
    // Title
    doc.fillColor('white')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('ONWARDS', 50, 25)
    
    doc.fontSize(14)
       .text('Community Support Organization', 50, 50)
    
    // Main title
    doc.fillColor('#333333')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('Member Registration Report', 50, 150)
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December']
    
    doc.fontSize(16)
       .text(`${monthNames[monthNum - 1]} ${yearNum}`, 50, 180)
    
    // Summary statistics
    doc.fontSize(14)
       .text(`Total Members Registered: ${report.totalMembers}`, 50, 220)
       .text(`Report Generated: ${new Date().toLocaleDateString('en-GB')}`, 50, 240)
    
    // Disclaimer
    doc.fontSize(10)
       .fillColor('#666666')
       .text('This report contains demographic data for members registered during the specified period.', 50, 700)
       .text('Data is collected to support funding applications and improve services.', 50, 715)
       .text('All personal information is handled in accordance with GDPR and our privacy policy.', 50, 730)
    
    // Check if we have any data to display
    if (report.totalMembers === 0) {
      doc.addPage()
      doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#eecbf5').fill()
      doc.rect(0, 0, doc.page.width, 60).fillColor('#a672b0').fill()
      doc.fillColor('white').fontSize(18).font('Helvetica-Bold').text('No Data Available', 50, 20)
      doc.fillColor('black').fontSize(14).text(`No members were registered in ${monthNames[monthNum - 1]} ${yearNum}.`, 50, 100)
    } else {
      // Page 2: Gender Distribution
      doc.addPage()
      doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#eecbf5').fill()
      doc.rect(0, 0, doc.page.width, 60).fillColor('#a672b0').fill()
      
      doc.fillColor('white').fontSize(18).font('Helvetica-Bold').text('Gender Distribution', 50, 20)
      
      if (Object.keys(report.summary.genderBreakdown).length > 0) {
        drawPieChart(doc, 300, 200, 80, report.summary.genderBreakdown, 'Gender Distribution')
      } else {
        doc.fillColor('black').fontSize(14).text('No gender data available', 50, 100)
      }
      
      // Page 3: Age Groups
      doc.addPage()
      doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#eecbf5').fill()
      doc.rect(0, 0, doc.page.width, 60).fillColor('#a672b0').fill()
      
      doc.fillColor('white').fontSize(18).font('Helvetica-Bold').text('Age Groups', 50, 20)
      
      if (Object.keys(report.summary.ageGroups).length > 0) {
        drawVerticalBarChart(doc, 50, 100, 500, 200, report.summary.ageGroups, 'Age Groups')
      } else {
        doc.fillColor('black').fontSize(14).text('No age group data available', 50, 100)
      }
      
      // Page 4: Medical Conditions (only if we have data)
      if (Object.keys(report.summary.medicalConditionsBreakdown).length > 0) {
        doc.addPage()
        doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#eecbf5').fill()
        doc.rect(0, 0, doc.page.width, 60).fillColor('#a672b0').fill()
        
        doc.fillColor('white').fontSize(18).font('Helvetica-Bold').text('Medical Conditions', 50, 20)
        
        drawHorizontalBarChart(doc, 50, 100, 450, 300, report.summary.medicalConditionsBreakdown, 'Medical Conditions')
      }
    }
    
    // Add debug information page for testing
    doc.addPage()
    doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#eecbf5').fill()
    doc.rect(0, 0, doc.page.width, 60).fillColor('#a672b0').fill()
    
    doc.fillColor('white').fontSize(18).font('Helvetica-Bold').text('Debug Information', 50, 20)
    
    doc.fillColor('black').fontSize(10)
    let debugY = 80
    doc.text(`Report Period: ${monthNames[monthNum - 1]} ${yearNum}`, 50, debugY)
    debugY += 15
    doc.text(`Total Members: ${report.totalMembers}`, 50, debugY)
    debugY += 15
    doc.text(`Gender Data: ${JSON.stringify(report.summary.genderBreakdown)}`, 50, debugY)
    debugY += 15
    doc.text(`Age Groups: ${JSON.stringify(report.summary.ageGroups)}`, 50, debugY)
    debugY += 15
    doc.text(`Medical Conditions: ${JSON.stringify(report.summary.medicalConditionsBreakdown)}`, 50, debugY)
    
    doc.end()
  } catch (error) {
    console.error('Generate member report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router