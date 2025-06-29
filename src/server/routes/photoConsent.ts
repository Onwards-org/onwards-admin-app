import express from 'express'
import { PhotoConsentModel } from '../models/PhotoConsent.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import * as v from 'valibot'

const router = express.Router()

const PhotoConsentSchema = v.object({
  event_date: v.string([v.minLength(1, 'Event date is required')]),
  event_type: v.string([v.minLength(1, 'Event type is required')]),
  participant_name: v.string([v.minLength(2, 'Participant name must be at least 2 characters')]),
  participant_signature: v.string([v.minLength(2, 'Participant signature is required')]),
  adult_consent: v.boolean(),
  child_consent: v.boolean(),
  child_names: v.optional(v.string()),
  responsible_adult_name: v.optional(v.string()),
  responsible_adult_signature: v.optional(v.string())
})

// Public route for form submission
router.post('/submit', async (req, res) => {
  try {
    const data = v.parse(PhotoConsentSchema, req.body)
    
    // Validate child consent logic
    if (data.child_consent && (!data.child_names || !data.responsible_adult_name || !data.responsible_adult_signature)) {
      return res.status(400).json({ 
        error: 'Child names, responsible adult name, and signature are required when child consent is selected' 
      })
    }
    
    const form = await PhotoConsentModel.create(data)
    
    res.status(201).json({
      message: 'Photo consent form submitted successfully',
      form: { id: form.id, participant_name: form.participant_name }
    })
  } catch (error) {
    console.error('Photo consent submission error:', error)
    
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
    
    const forms = await PhotoConsentModel.list(limit, offset)
    const total = await PhotoConsentModel.count()
    
    res.json({
      forms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('List photo consent forms error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const formId = parseInt(id)
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' })
    }
    
    const form = await PhotoConsentModel.findById(formId)
    if (!form) {
      return res.status(404).json({ error: 'Form not found' })
    }
    
    res.json(form)
  } catch (error) {
    console.error('Get photo consent form error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const formId = parseInt(id)
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' })
    }
    
    const form = await PhotoConsentModel.findById(formId)
    if (!form) {
      return res.status(404).json({ error: 'Form not found' })
    }
    
    await PhotoConsentModel.delete(formId)
    res.json({ message: 'Photo consent form deleted successfully' })
  } catch (error) {
    console.error('Delete photo consent form error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router