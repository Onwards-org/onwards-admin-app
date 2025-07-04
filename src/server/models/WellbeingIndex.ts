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
    
    // Calculate wellbeing score from all 5 questions (5-30 scale)
    const wellbeingQuestions = ['happy_content', 'calm_relaxed', 'active_vigorous', 'fresh_rested', 'daily_interest']
    const wellbeing_score = wellbeingQuestions.reduce((sum, q) => sum + (formData.responses[q] || 0), 0)
    
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
      wellbeing_score, // wellbeing_score from all 5 questions
      wellbeing_score, // mental_health_score = same as wellbeing
      wellbeing_score, // social_score = same as wellbeing
      wellbeing_score, // physical_health_score = same as wellbeing
      wellbeing_score, // purpose_score = same as wellbeing
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
    avgWellbeingScore: number,
    wellbeingScoreDistribution: Record<string, number>,
    questionBreakdowns: Record<string, Record<string, number>>,
    previousMonthComparison?: {
      avgScoreDiff: number,
      totalResponsesDiff: number
    }
  }> {
    const pool = getPool()
    
    // Get submissions for the specified month
    const query = `
      SELECT * FROM wellbeing_index_submissions 
      WHERE EXTRACT(YEAR FROM created_at) = $1 
      AND EXTRACT(MONTH FROM created_at) = $2
    `
    const result = await pool.query(query, [year, month])
    const submissions = result.rows.map(row => ({
      ...row,
      responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses
    }))
    
    // Get previous month data for comparison
    let prevMonth = month - 1
    let prevYear = year
    if (prevMonth === 0) {
      prevMonth = 12
      prevYear = year - 1
    }
    
    const prevQuery = `
      SELECT * FROM wellbeing_index_submissions 
      WHERE EXTRACT(YEAR FROM created_at) = $1 
      AND EXTRACT(MONTH FROM created_at) = $2
    `
    const prevResult = await pool.query(prevQuery, [prevYear, prevMonth])
    const prevSubmissions = prevResult.rows
    
    if (submissions.length === 0) {
      return {
        totalResponses: 0,
        avgWellbeingScore: 0,
        wellbeingScoreDistribution: {},
        questionBreakdowns: {},
        previousMonthComparison: prevSubmissions.length > 0 ? {
          avgScoreDiff: -((prevSubmissions.reduce((sum, s) => sum + s.wellbeing_score, 0) / prevSubmissions.length)),
          totalResponsesDiff: -prevSubmissions.length
        } : undefined
      }
    }
    
    // Calculate averages
    const totalResponses = submissions.length
    const avgWellbeingScore = submissions.reduce((sum, s) => sum + s.wellbeing_score, 0) / totalResponses
    
    // Previous month comparison
    let previousMonthComparison: { avgScoreDiff: number, totalResponsesDiff: number } | undefined
    if (prevSubmissions.length > 0) {
      const prevAvgScore = prevSubmissions.reduce((sum, s) => sum + s.wellbeing_score, 0) / prevSubmissions.length
      previousMonthComparison = {
        avgScoreDiff: Math.round((avgWellbeingScore - prevAvgScore) * 10) / 10,
        totalResponsesDiff: totalResponses - prevSubmissions.length
      }
    }
    
    // Calculate distributions for 5-30 scale
    const wellbeingScoreDistribution: Record<string, number> = {
      'Very Low (5-10)': 0,
      'Low (11-15)': 0,
      'Below Average (16-20)': 0,
      'Average (21-25)': 0,
      'High (26-30)': 0
    }
    
    submissions.forEach(submission => {
      // Wellbeing score distribution (5-30 scale)
      const score = submission.wellbeing_score
      if (score >= 5 && score <= 10) {
        wellbeingScoreDistribution['Very Low (5-10)']++
      } else if (score >= 11 && score <= 15) {
        wellbeingScoreDistribution['Low (11-15)']++
      } else if (score >= 16 && score <= 20) {
        wellbeingScoreDistribution['Below Average (16-20)']++
      } else if (score >= 21 && score <= 25) {
        wellbeingScoreDistribution['Average (21-25)']++
      } else if (score >= 26 && score <= 30) {
        wellbeingScoreDistribution['High (26-30)']++
      }
    })
    
    // Individual question breakdowns
    const questionLabels = {
      'happy_content': 'Happy and Content',
      'calm_relaxed': 'Calm and Relaxed',
      'active_vigorous': 'Active and Vigorous',
      'fresh_rested': 'Fresh and Rested',
      'daily_interest': 'Daily Interest and Enthusiasm'
    }
    
    const responseLabels = {
      1: 'None of the time',
      2: 'Some of the time',
      3: 'Less than half of the time',
      4: 'More than half of the time',
      5: 'Most of the time',
      6: 'All of the time'
    }
    
    const questionBreakdowns: Record<string, Record<string, number>> = {}
    
    Object.entries(questionLabels).forEach(([questionKey, questionLabel]) => {
      questionBreakdowns[questionLabel] = {
        'None of the time': 0,
        'Some of the time': 0,
        'Less than half of the time': 0,
        'More than half of the time': 0,
        'Most of the time': 0,
        'All of the time': 0
      }
      
      submissions.forEach(submission => {
        if (submission.responses && submission.responses[questionKey]) {
          const responseValue = submission.responses[questionKey]
          const responseLabel = responseLabels[responseValue as keyof typeof responseLabels]
          if (responseLabel) {
            questionBreakdowns[questionLabel][responseLabel]++
          }
        }
      })
    })
    
    return {
      totalResponses,
      avgWellbeingScore: Math.round(avgWellbeingScore * 10) / 10,
      wellbeingScoreDistribution,
      questionBreakdowns,
      previousMonthComparison
    }
  }
}