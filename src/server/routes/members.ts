import express from 'express'
import { MemberModel } from '../models/Member.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import * as v from 'valibot'
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

export default router