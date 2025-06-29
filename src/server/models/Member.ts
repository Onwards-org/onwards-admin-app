import { getPool } from './database.js'
import type { Member, EmergencyContact, MedicalCondition, ChallengingBehaviour } from '../../shared/types.js'

interface MemberDemographicData {
  gender: string
  birth_year: number
  ethnicity: string
  sexual_orientation: string
  employment_status: string
  postcode: string
  medical_conditions: string[]
}

interface MemberReport {
  month: number
  year: number
  totalMembers: number
  demographicData: MemberDemographicData[]
  summary: {
    genderBreakdown: Record<string, number>
    ageGroups: Record<string, number>
    ethnicityBreakdown: Record<string, number>
    sexualOrientationBreakdown: Record<string, number>
    employmentBreakdown: Record<string, number>
    locationBreakdown: Record<string, number>
    medicalConditionsBreakdown: Record<string, number>
  }
}

export class MemberModel {
  static async create(memberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Promise<Member> {
    const pool = getPool()
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      const memberQuery = `
        INSERT INTO members (
          name, phone, email, address, postcode, birth_month, birth_year,
          employment_status, ethnicity, religion, gender, sexual_orientation,
          transgender_status, hobbies_interests, pregnancy_maternity,
          additional_health_info, privacy_accepted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `
      
      const memberResult = await client.query(memberQuery, [
        memberData.name, memberData.phone, memberData.email, memberData.address,
        memberData.postcode, memberData.birth_month, memberData.birth_year, memberData.employment_status,
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
  
  static async generateMonthlyReport(month: number, year: number): Promise<MemberReport> {
    const pool = getPool()
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    
    const query = `
      SELECT DISTINCT
        m.gender,
        m.birth_year,
        m.ethnicity,
        m.sexual_orientation,
        m.employment_status,
        COALESCE(m.postcode, SUBSTRING(m.address FROM '[A-Z]{1,2}[0-9]{1,2}[A-Z]?')) as postcode,
        array_agg(DISTINCT mc.condition) FILTER (WHERE mc.condition IS NOT NULL) as medical_conditions
      FROM members m
      LEFT JOIN medical_conditions mc ON m.id = mc.member_id
      WHERE m.created_at >= $1 AND m.created_at <= $2
      GROUP BY m.id, m.gender, m.birth_year, m.ethnicity, m.sexual_orientation, m.employment_status, m.postcode, m.address
    `
    
    const result = await pool.query(query, [startDate, endDate])
    const data = result.rows
    
    // Helper function to get location from postcode
    const getLocationFromPostcode = (postcode: string): string => {
      if (!postcode) return 'Unknown'
      
      const postcodeUpper = postcode.toUpperCase()
      
      // Walsall postcodes
      if (postcodeUpper.startsWith('WS1') || postcodeUpper.startsWith('WS2') || 
          postcodeUpper.startsWith('WS3') || postcodeUpper.startsWith('WS4') || 
          postcodeUpper.startsWith('WS5') || postcodeUpper.startsWith('WS6') ||
          postcodeUpper.startsWith('WS7') || postcodeUpper.startsWith('WS8') ||
          postcodeUpper.startsWith('WS9') || postcodeUpper.startsWith('WS10') ||
          postcodeUpper.startsWith('WS11') || postcodeUpper.startsWith('WS12') ||
          postcodeUpper.startsWith('WS13') || postcodeUpper.startsWith('WS14') ||
          postcodeUpper.startsWith('WS15')) {
        return 'Walsall'
      }
      
      // Birmingham postcodes
      if (postcodeUpper.startsWith('B')) {
        return 'Birmingham'
      }
      
      // West Midlands general
      if (postcodeUpper.startsWith('DY') || postcodeUpper.startsWith('WV')) {
        return 'West Midlands'
      }
      
      return 'Other'
    }
    
    // Helper function to get age group
    const getAgeGroup = (birthYear: number): string => {
      const currentYear = new Date().getFullYear()
      const age = currentYear - birthYear
      
      if (age < 18) return 'Under 18'
      if (age < 25) return '18-24'
      if (age < 35) return '25-34'
      if (age < 45) return '35-44'
      if (age < 55) return '45-54'
      if (age < 65) return '55-64'
      return '65+'
    }
    
    // Process demographic data and create summaries
    const genderBreakdown: Record<string, number> = {}
    const ageGroups: Record<string, number> = {}
    const ethnicityBreakdown: Record<string, number> = {}
    const sexualOrientationBreakdown: Record<string, number> = {}
    const employmentBreakdown: Record<string, number> = {}
    const locationBreakdown: Record<string, number> = {}
    const medicalConditionsBreakdown: Record<string, number> = {}
    
    data.forEach((member: MemberDemographicData) => {
      // Gender breakdown
      genderBreakdown[member.gender] = (genderBreakdown[member.gender] || 0) + 1
      
      // Age groups
      const ageGroup = getAgeGroup(member.birth_year)
      ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1
      
      // Ethnicity breakdown
      ethnicityBreakdown[member.ethnicity] = (ethnicityBreakdown[member.ethnicity] || 0) + 1
      
      // Sexual orientation breakdown
      sexualOrientationBreakdown[member.sexual_orientation] = (sexualOrientationBreakdown[member.sexual_orientation] || 0) + 1
      
      // Employment breakdown
      employmentBreakdown[member.employment_status] = (employmentBreakdown[member.employment_status] || 0) + 1
      
      // Location breakdown
      const location = getLocationFromPostcode(member.postcode)
      locationBreakdown[location] = (locationBreakdown[location] || 0) + 1
      
      // Medical conditions breakdown
      if (member.medical_conditions && Array.isArray(member.medical_conditions)) {
        member.medical_conditions.forEach((condition: string) => {
          if (condition) {
            medicalConditionsBreakdown[condition] = (medicalConditionsBreakdown[condition] || 0) + 1
          }
        })
      }
    })
    
    return {
      month,
      year,
      totalMembers: data.length,
      demographicData: data,
      summary: {
        genderBreakdown,
        ageGroups,
        ethnicityBreakdown,
        sexualOrientationBreakdown,
        employmentBreakdown,
        locationBreakdown,
        medicalConditionsBreakdown
      }
    }
  }
}