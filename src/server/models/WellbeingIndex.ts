import { getPool } from './database.js'

export interface WellbeingSubmission {
  id: number
  full_name: string
  purpose_score: number
  responses: Record<string, number>
  created_at: string
}

export class WellbeingIndexModel {
  static async create(formData: Omit<WellbeingSubmission, 'id' | 'created_at' | 'purpose_score'>): Promise<WellbeingSubmission> {
    const pool = getPool()
    
    // Calculate wellbeing score only
    const wellbeingQuestions = ['happy_content', 'calm_relaxed', 'active_vigorous', 'daily_interest']
    const purpose_score = wellbeingQuestions.reduce((sum, q) => sum + (formData.responses[q] || 0), 0)
    
    // Update database constraints for simplified form
    try {
      // Drop all existing constraints
      await pool.query(`
        ALTER TABLE wellbeing_index_submissions 
        DROP CONSTRAINT IF EXISTS wellbeing_index_submissions_wellbeing_score_check;
      `)
      await pool.query(`
        ALTER TABLE wellbeing_index_submissions 
        DROP CONSTRAINT IF EXISTS wellbeing_index_submissions_mental_health_score_check;
      `)
      await pool.query(`
        ALTER TABLE wellbeing_index_submissions 
        DROP CONSTRAINT IF EXISTS wellbeing_index_submissions_social_score_check;
      `)
      await pool.query(`
        ALTER TABLE wellbeing_index_submissions 
        DROP CONSTRAINT IF EXISTS wellbeing_index_submissions_physical_health_score_check;
      `)
      await pool.query(`
        ALTER TABLE wellbeing_index_submissions 
        DROP CONSTRAINT IF EXISTS wellbeing_index_submissions_purpose_score_check;
      `)
      
      // Add new constraints for the simplified form (4-24 range for all scores)
      await pool.query(`
        ALTER TABLE wellbeing_index_submissions 
        ADD CONSTRAINT wellbeing_index_submissions_wellbeing_score_check 
        CHECK (wellbeing_score >= 4 AND wellbeing_score <= 24);
      `)
      await pool.query(`
        ALTER TABLE wellbeing_index_submissions 
        ADD CONSTRAINT wellbeing_index_submissions_mental_health_score_check 
        CHECK (mental_health_score >= 4 AND mental_health_score <= 24);
      `)
      await pool.query(`
        ALTER TABLE wellbeing_index_submissions 
        ADD CONSTRAINT wellbeing_index_submissions_social_score_check 
        CHECK (social_score >= 4 AND social_score <= 24);
      `)
      await pool.query(`
        ALTER TABLE wellbeing_index_submissions 
        ADD CONSTRAINT wellbeing_index_submissions_physical_health_score_check 
        CHECK (physical_health_score >= 4 AND physical_health_score <= 24);
      `)
      await pool.query(`
        ALTER TABLE wellbeing_index_submissions 
        ADD CONSTRAINT wellbeing_index_submissions_purpose_score_check 
        CHECK (purpose_score >= 4 AND purpose_score <= 24);
      `)
    } catch (error) {
      console.log('Database constraint update error (continuing):', error)
    }

    const query = `
      INSERT INTO wellbeing_index_submissions (
        full_name, email, age_group, gender, location,
        wellbeing_score, mental_health_score, social_score, 
        physical_health_score, purpose_score, responses, additional_comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `
    
    const result = await pool.query(query, [
      formData.full_name,
      null, // email
      'Not specified', // age_group  
      null, // gender
      null, // location
      purpose_score, // wellbeing_score = purpose_score only
      purpose_score, // mental_health_score = purpose_score (dummy data)
      purpose_score, // social_score = purpose_score (dummy data)
      purpose_score, // physical_health_score = purpose_score (dummy data)
      purpose_score,
      JSON.stringify(formData.responses),
      null // additional_comments
    ])
    
    return result.rows[0]
  }
  
  static async list(limit?: number, offset?: number): Promise<WellbeingSubmission[]> {
    const pool = getPool()
    let query = 'SELECT * FROM wellbeing_index_submissions ORDER BY created_at DESC'
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
    return result.rows.map(row => ({
      ...row,
      responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses
    }))
  }
  
  static async findById(id: number): Promise<WellbeingSubmission | null> {
    const pool = getPool()
    const query = 'SELECT * FROM wellbeing_index_submissions WHERE id = $1'
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      ...row,
      responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses
    }
  }
  
  static async count(): Promise<number> {
    const pool = getPool()
    const query = 'SELECT COUNT(*) as count FROM wellbeing_index_submissions'
    const result = await pool.query(query)
    
    return parseInt(result.rows[0].count)
  }
  
  static async delete(id: number): Promise<void> {
    const pool = getPool()
    const query = 'DELETE FROM wellbeing_index_submissions WHERE id = $1'
    await pool.query(query, [id])
  }
  
  static async generateMonthlyReport(year: number, month: number): Promise<{
    totalResponses: number,
    avgPurposeScore: number,
    purposeScoreDistribution: Record<string, number>
  }> {
    const pool = getPool()
    
    // Get submissions for the specified month
    const query = `
      SELECT * FROM wellbeing_index_submissions 
      WHERE EXTRACT(YEAR FROM created_at) = $1 
      AND EXTRACT(MONTH FROM created_at) = $2
    `
    const result = await pool.query(query, [year, month])
    const submissions = result.rows
    
    if (submissions.length === 0) {
      return {
        totalResponses: 0,
        avgPurposeScore: 0,
        purposeScoreDistribution: {}
      }
    }
    
    // Calculate averages
    const totalResponses = submissions.length
    const avgPurposeScore = submissions.reduce((sum, s) => sum + s.purpose_score, 0) / totalResponses
    
    // Calculate distributions
    const purposeScoreDistribution: Record<string, number> = {
      'Low (4-8)': 0,
      'Below Average (9-12)': 0,
      'Average (13-16)': 0,
      'Above Average (17-20)': 0,
      'High (21-24)': 0
    }
    
    submissions.forEach(submission => {
      // Wellbeing score distribution
      const score = submission.purpose_score
      if (score >= 4 && score <= 8) {
        purposeScoreDistribution['Low (4-8)']++
      } else if (score >= 9 && score <= 12) {
        purposeScoreDistribution['Below Average (9-12)']++
      } else if (score >= 13 && score <= 16) {
        purposeScoreDistribution['Average (13-16)']++
      } else if (score >= 17 && score <= 20) {
        purposeScoreDistribution['Above Average (17-20)']++
      } else if (score >= 21 && score <= 24) {
        purposeScoreDistribution['High (21-24)']++
      }
    })
    
    return {
      totalResponses,
      avgPurposeScore: Math.round(avgPurposeScore * 10) / 10,
      purposeScoreDistribution
    }
  }
}