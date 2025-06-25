import { getPool } from './database.js'
import type { Member, EmergencyContact, MedicalCondition, ChallengingBehaviour } from '../../shared/types.js'

export class MemberModel {
  static async create(memberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Promise<Member> {
    const pool = getPool()
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      const memberQuery = `
        INSERT INTO members (
          name, phone, email, address, birth_month, birth_year,
          employment_status, ethnicity, religion, gender, sexual_orientation,
          transgender_status, hobbies_interests, pregnancy_maternity,
          additional_health_info, privacy_accepted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `
      
      const memberResult = await client.query(memberQuery, [
        memberData.name, memberData.phone, memberData.email, memberData.address,
        memberData.birth_month, memberData.birth_year, memberData.employment_status,
        memberData.ethnicity, memberData.religion, memberData.gender,
        memberData.sexual_orientation, memberData.transgender_status,
        memberData.hobbies_interests, memberData.pregnancy_maternity,
        memberData.additional_health_info, memberData.privacy_accepted
      ])
      
      await client.query('COMMIT')
      return memberResult.rows[0]
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
  
  static async findById(id: number): Promise<Member | null> {
    const pool = getPool()
    const query = 'SELECT * FROM members WHERE id = $1'
    const result = await pool.query(query, [id])
    
    return result.rows[0] || null
  }
  
  static async findByEmail(email: string): Promise<Member | null> {
    const pool = getPool()
    const query = 'SELECT * FROM members WHERE email = $1'
    const result = await pool.query(query, [email])
    
    return result.rows[0] || null
  }
  
  static async list(limit?: number, offset?: number): Promise<Member[]> {
    const pool = getPool()
    let query = 'SELECT * FROM members ORDER BY created_at DESC'
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
  
  static async update(id: number, memberData: Partial<Omit<Member, 'id' | 'created_at' | 'updated_at'>>): Promise<Member> {
    const pool = getPool()
    const fields = Object.keys(memberData)
    const values = Object.values(memberData)
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
    const query = `UPDATE members SET ${setClause} WHERE id = $1 RETURNING *`
    
    const result = await pool.query(query, [id, ...values])
    return result.rows[0]
  }
  
  static async delete(id: number): Promise<void> {
    const pool = getPool()
    const query = 'DELETE FROM members WHERE id = $1'
    await pool.query(query, [id])
  }
  
  static async count(): Promise<number> {
    const pool = getPool()
    const query = 'SELECT COUNT(*) as count FROM members'
    const result = await pool.query(query)
    
    return parseInt(result.rows[0].count)
  }
  
  static async addEmergencyContact(memberId: number, contact: Omit<EmergencyContact, 'id' | 'member_id'>): Promise<EmergencyContact> {
    const pool = getPool()
    const query = `
      INSERT INTO emergency_contacts (member_id, name, phone)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    
    const result = await pool.query(query, [memberId, contact.name, contact.phone])
    return result.rows[0]
  }
  
  static async getEmergencyContacts(memberId: number): Promise<EmergencyContact[]> {
    const pool = getPool()
    const query = 'SELECT * FROM emergency_contacts WHERE member_id = $1'
    const result = await pool.query(query, [memberId])
    
    return result.rows
  }
  
  static async addMedicalCondition(memberId: number, condition: string): Promise<MedicalCondition> {
    const pool = getPool()
    const query = `
      INSERT INTO medical_conditions (member_id, condition)
      VALUES ($1, $2)
      RETURNING *
    `
    
    const result = await pool.query(query, [memberId, condition])
    return result.rows[0]
  }
  
  static async getMedicalConditions(memberId: number): Promise<MedicalCondition[]> {
    const pool = getPool()
    const query = 'SELECT * FROM medical_conditions WHERE member_id = $1'
    const result = await pool.query(query, [memberId])
    
    return result.rows
  }
  
  static async addChallengingBehaviour(memberId: number, behaviour: string): Promise<ChallengingBehaviour> {
    const pool = getPool()
    const query = `
      INSERT INTO challenging_behaviours (member_id, behaviour)
      VALUES ($1, $2)
      RETURNING *
    `
    
    const result = await pool.query(query, [memberId, behaviour])
    return result.rows[0]
  }
  
  static async getChallengingBehaviours(memberId: number): Promise<ChallengingBehaviour[]> {
    const pool = getPool()
    const query = 'SELECT * FROM challenging_behaviours WHERE member_id = $1'
    const result = await pool.query(query, [memberId])
    
    return result.rows
  }
}