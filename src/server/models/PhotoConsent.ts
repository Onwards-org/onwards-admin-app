import { getPool } from './database.js'

export interface PhotoConsentForm {
  id: number
  event_date: string
  event_type: string
  participant_name: string
  participant_signature: string
  adult_consent: boolean
  child_consent: boolean
  child_names?: string
  responsible_adult_name?: string
  responsible_adult_signature?: string
  submission_date: string
  created_at: string
}

export class PhotoConsentModel {
  static async create(formData: Omit<PhotoConsentForm, 'id' | 'submission_date' | 'created_at'>): Promise<PhotoConsentForm> {
    const pool = getPool()
    const query = `
      INSERT INTO photo_consent_forms (
        event_date, event_type, participant_name, participant_signature,
        adult_consent, child_consent, child_names, responsible_adult_name,
        responsible_adult_signature
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `
    
    const result = await pool.query(query, [
      formData.event_date,
      formData.event_type,
      formData.participant_name,
      formData.participant_signature,
      formData.adult_consent,
      formData.child_consent,
      formData.child_names,
      formData.responsible_adult_name,
      formData.responsible_adult_signature
    ])
    
    return result.rows[0]
  }
  
  static async list(limit?: number, offset?: number): Promise<PhotoConsentForm[]> {
    const pool = getPool()
    let query = 'SELECT * FROM photo_consent_forms ORDER BY created_at DESC'
    const params: any[] = []
    
    if (limit) {
      query += ` LIMIT $${params.length + 1}`
      params.push(limit)
    }
    
    if (offset) {
      query += ` OFFSET $${params.length + 1}`
      params.push(offset)
    }
    
    const result = await pool.query(query, params)
    return result.rows
  }
  
  static async findById(id: number): Promise<PhotoConsentForm | null> {
    const pool = getPool()
    const query = 'SELECT * FROM photo_consent_forms WHERE id = $1'
    const result = await pool.query(query, [id])
    
    return result.rows[0] || null
  }
  
  static async count(): Promise<number> {
    const pool = getPool()
    const query = 'SELECT COUNT(*) as count FROM photo_consent_forms'
    const result = await pool.query(query)
    
    return parseInt(result.rows[0].count)
  }
  
  static async delete(id: number): Promise<void> {
    const pool = getPool()
    const query = 'DELETE FROM photo_consent_forms WHERE id = $1'
    await pool.query(query, [id])
  }
}