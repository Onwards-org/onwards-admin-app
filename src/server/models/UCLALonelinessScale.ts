import { getPool } from './database.js'

export interface UCLASubmission {
  id?: number
  name: string
  isolated_response: 'hardly_ever' | 'some_of_the_time' | 'often'
  left_out_response: 'hardly_ever' | 'some_of_the_time' | 'often'
  lack_companionship_response: 'hardly_ever' | 'some_of_the_time' | 'often'
  submission_date?: Date
  created_at?: Date
}

export interface UCLAReportStats {
  isolated_responses: Record<string, number>
  left_out_responses: Record<string, number>
  lack_companionship_responses: Record<string, number>
  total_submissions: number
  submission_dates: string[]
}

export class UCLALonelinessScaleModel {
  static async submit(submission: UCLASubmission): Promise<UCLASubmission> {
    const pool = getPool()
    
    const query = `
      INSERT INTO ucla_loneliness_scale (
        name, isolated_response, left_out_response, lack_companionship_response, submission_date
      ) VALUES ($1, $2, $3, $4, CURRENT_DATE)
      RETURNING *
    `
    
    const values = [
      submission.name,
      submission.isolated_response,
      submission.left_out_response,
      submission.lack_companionship_response
    ]
    
    const result = await pool.query(query, values)
    return result.rows[0]
  }

  static async getSubmissions(startDate?: Date, endDate?: Date): Promise<UCLASubmission[]> {
    const pool = getPool()
    
    let query = 'SELECT * FROM ucla_loneliness_scale'
    const values: any[] = []
    
    if (startDate || endDate) {
      query += ' WHERE'
      const conditions = []
      
      if (startDate) {
        values.push(startDate)
        conditions.push(` submission_date >= $${values.length}`)
      }
      
      if (endDate) {
        values.push(endDate)
        conditions.push(` submission_date <= $${values.length}`)
      }
      
      query += conditions.join(' AND')
    }
    
    query += ' ORDER BY submission_date DESC, created_at DESC'
    
    const result = await pool.query(query, values)
    return result.rows
  }

  static async generateMonthlyReport(month: number, year: number): Promise<{ stats: UCLAReportStats; month: number; year: number }> {
    const pool = getPool()
    
    // Get start and end dates for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // Last day of the month
    
    const query = `
      SELECT 
        isolated_response,
        left_out_response,
        lack_companionship_response,
        submission_date
      FROM ucla_loneliness_scale 
      WHERE submission_date >= $1 AND submission_date <= $2
      ORDER BY submission_date
    `
    
    const result = await pool.query(query, [startDate, endDate])
    const submissions = result.rows
    
    // Initialize response counters
    const isolated_responses = {
      'hardly_ever': 0,
      'some_of_the_time': 0,
      'often': 0
    }
    
    const left_out_responses = {
      'hardly_ever': 0,
      'some_of_the_time': 0,
      'often': 0
    }
    
    const lack_companionship_responses = {
      'hardly_ever': 0,
      'some_of_the_time': 0,
      'often': 0
    }
    
    const submission_dates: string[] = []
    
    // Process each submission
    submissions.forEach((submission: any) => {
      isolated_responses[submission.isolated_response]++
      left_out_responses[submission.left_out_response]++
      lack_companionship_responses[submission.lack_companionship_response]++
      
      const dateStr = submission.submission_date.toISOString().split('T')[0]
      if (!submission_dates.includes(dateStr)) {
        submission_dates.push(dateStr)
      }
    })
    
    return {
      stats: {
        isolated_responses,
        left_out_responses,
        lack_companionship_responses,
        total_submissions: submissions.length,
        submission_dates: submission_dates.sort()
      },
      month,
      year
    }
  }

  static async getSubmissionsByName(name: string): Promise<UCLASubmission[]> {
    const pool = getPool()
    
    const query = `
      SELECT * FROM ucla_loneliness_scale 
      WHERE LOWER(name) = LOWER($1)
      ORDER BY submission_date DESC, created_at DESC
    `
    
    const result = await pool.query(query, [name])
    return result.rows
  }

  static async getMonthlyTrends(months: number = 6): Promise<Array<{ month: string; total: number }>> {
    const pool = getPool()
    
    const query = `
      SELECT 
        DATE_TRUNC('month', submission_date) as month,
        COUNT(*) as total
      FROM ucla_loneliness_scale 
      WHERE submission_date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', submission_date)
      ORDER BY month DESC
    `
    
    const result = await pool.query(query)
    return result.rows.map(row => ({
      month: row.month.toISOString().substring(0, 7), // YYYY-MM format
      total: parseInt(row.total)
    }))
  }
}