import { getPool } from './database.js'
import type { Attendance, AttendanceReport } from '../../shared/types.js'

export class AttendanceModel {
  static async record(memberId: number, date: Date, present: boolean = true): Promise<Attendance> {
    const pool = getPool()
    const query = `
      INSERT INTO attendance (member_id, date, present)
      VALUES ($1, $2, $3)
      ON CONFLICT (member_id, date)
      DO UPDATE SET present = $3
      RETURNING *
    `
    
    const result = await pool.query(query, [memberId, date, present])
    return result.rows[0]
  }
  
  static async getByDate(date: Date): Promise<(Attendance & { member_name: string })[]> {
    const pool = getPool()
    const query = `
      SELECT a.*, m.name as member_name
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      WHERE a.date = $1
      ORDER BY m.name
    `
    
    const result = await pool.query(query, [date])
    return result.rows
  }
  
  static async getByMember(memberId: number, startDate?: Date, endDate?: Date): Promise<Attendance[]> {
    const pool = getPool()
    let query = 'SELECT * FROM attendance WHERE member_id = $1'
    const params: any[] = [memberId]
    
    if (startDate) {
      query += ` AND date >= $${params.length + 1}`
      params.push(startDate)
    }
    
    if (endDate) {
      query += ` AND date <= $${params.length + 1}`
      params.push(endDate)
    }
    
    query += ' ORDER BY date DESC'
    
    const result = await pool.query(query, params)
    return result.rows
  }
  
  static async getDateRange(startDate: Date, endDate: Date): Promise<(Attendance & { member_name: string })[]> {
    const pool = getPool()
    const query = `
      SELECT a.*, m.name as member_name
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      WHERE a.date >= $1 AND a.date <= $2 AND a.present = true
      ORDER BY a.date DESC, m.name
    `
    
    const result = await pool.query(query, [startDate, endDate])
    return result.rows
  }
  
  static async getMembersForDate(date: Date): Promise<{ id: number; name: string; present: boolean }[]> {
    const pool = getPool()
    
    // Check if session is cancelled first
    const sessionQuery = 'SELECT status FROM sessions WHERE date = $1'
    const sessionResult = await pool.query(sessionQuery, [date])
    
    // If session is cancelled, return empty array (no attendance records)
    if (sessionResult.rows.length > 0 && sessionResult.rows[0].status === 'cancelled') {
      return []
    }
    
    const query = `
      SELECT 
        m.id,
        m.name,
        COALESCE(a.present, false) as present
      FROM members m
      LEFT JOIN attendance a ON m.id = a.member_id AND a.date = $1
      ORDER BY 
        UPPER(
          CASE 
            WHEN m.name LIKE '%(%' THEN 
              -- Handle names like "Naseem (naz) koser" - extract surname after parentheses
              TRIM(SUBSTRING(m.name FROM POSITION(')' IN m.name) + 1))
            WHEN m.name LIKE '% %' THEN 
              -- Handle regular "First Last" names - get last word after last space
              TRIM(SUBSTRING(m.name FROM '[^ ]*$'))
            ELSE m.name
          END
        )
    `
    
    const result = await pool.query(query, [date])
    return result.rows
  }
  
  static async deleteByDate(date: Date): Promise<void> {
    const pool = getPool()
    const query = 'DELETE FROM attendance WHERE date = $1'
    await pool.query(query, [date])
  }
  
  static async generateMonthlyReport(month: number, year: number): Promise<AttendanceReport> {
    const pool = getPool()
    // Use UTC dates to avoid timezone issues
    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
    
    const query = `
      SELECT DISTINCT
        m.gender,
        m.birth_year,
        m.ethnicity,
        m.sexual_orientation,
        m.employment_status,
        SUBSTRING(m.address FROM '[A-Z]{1,2}[0-9]{1,2}[A-Z]?') as postcode,
        array_agg(DISTINCT mc.condition) FILTER (WHERE mc.condition IS NOT NULL) as medical_conditions
      FROM members m
      JOIN attendance a ON m.id = a.member_id
      LEFT JOIN medical_conditions mc ON m.id = mc.member_id
      WHERE a.date >= $1 AND a.date <= $2 AND a.present = true
      GROUP BY m.id, m.gender, m.birth_year, m.ethnicity, m.sexual_orientation, m.employment_status, m.address
    `
    
    const result = await pool.query(query, [startDate, endDate])
    const data = result.rows
    
    // Helper function to get detailed geographical location from postcode
    const getLocationFromPostcode = (postcode: string): string => {
      if (!postcode) return 'Unknown'
      
      const postcodeUpper = postcode.toUpperCase()
      
      // Detailed location mapping
      // Sutton Coldfield - B7x postcodes
      if (postcodeUpper.startsWith('B7')) {
        return 'Sutton Coldfield'
      }
      
      // Walsall area - WS postcodes
      if (postcodeUpper.startsWith('WS')) {
        return 'Walsall'
      }
      
      // Tamworth - B7x area (some overlap with Sutton Coldfield)
      if (postcodeUpper.startsWith('B77') || postcodeUpper.startsWith('B78') || postcodeUpper.startsWith('B79')) {
        return 'Tamworth'
      }
      
      // West Bromwich - B70, B71 postcodes
      if (postcodeUpper.startsWith('B70') || postcodeUpper.startsWith('B71')) {
        return 'West Bromwich'
      }
      
      // Lichfield - WS13-WS15 postcodes
      if (postcodeUpper.startsWith('WS13') || postcodeUpper.startsWith('WS14') || postcodeUpper.startsWith('WS15')) {
        return 'Lichfield'
      }
      
      // Smethwick - B66, B67 postcodes
      if (postcodeUpper.startsWith('B66') || postcodeUpper.startsWith('B67')) {
        return 'Smethwick'
      }
      
      // Shelfield - WS4 postcodes
      if (postcodeUpper.startsWith('WS4')) {
        return 'Shelfield'
      }
      
      // Wolverhampton - WV postcodes
      if (postcodeUpper.startsWith('WV')) {
        return 'Wolverhampton'
      }
      
      // Cradley Heath - B64 postcodes
      if (postcodeUpper.startsWith('B64')) {
        return 'Cradley Heath'
      }
      
      // Streetly - B74 postcodes
      if (postcodeUpper.startsWith('B74')) {
        return 'Streetly'
      }
      
      // Other Birmingham areas
      if (postcodeUpper.startsWith('B')) {
        return 'Other Birmingham'
      }
      
      // Other West Midlands areas
      if (postcodeUpper.startsWith('CV') || postcodeUpper.startsWith('DY') || 
          postcodeUpper.startsWith('WR') || postcodeUpper.startsWith('ST')) {
        return 'Other West Midlands'
      }
      
      return 'Other Areas'
    }

    const currentYear = new Date().getFullYear()
    const stats = {
      genders: {} as Record<string, number>,
      age_groups: {} as Record<string, number>,
      ethnicities: {} as Record<string, number>,
      disabilities: {} as Record<string, number>,
      sexual_orientations: {} as Record<string, number>,
      employment_status: {} as Record<string, number>,
      postcodes: {} as Record<string, number>,
      locations: {} as Record<string, number>
    }
    
    data.forEach((row: any) => {
      stats.genders[row.gender] = (stats.genders[row.gender] || 0) + 1
      stats.ethnicities[row.ethnicity] = (stats.ethnicities[row.ethnicity] || 0) + 1
      stats.sexual_orientations[row.sexual_orientation] = (stats.sexual_orientations[row.sexual_orientation] || 0) + 1
      stats.employment_status[row.employment_status] = (stats.employment_status[row.employment_status] || 0) + 1
      
      // Calculate age properly considering birth month
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
      let age = currentYear - row.birth_year
      
      // If birth month hasn't occurred yet this year, subtract 1 from age
      if (currentMonth < row.birth_month) {
        age--
      }
      let ageGroup = '65+'
      if (age < 18) ageGroup = 'Under 18'
      else if (age < 25) ageGroup = '18-24'
      else if (age < 35) ageGroup = '25-34'
      else if (age < 45) ageGroup = '35-44'
      else if (age < 55) ageGroup = '45-54'
      else if (age < 65) ageGroup = '55-64'
      
      stats.age_groups[ageGroup] = (stats.age_groups[ageGroup] || 0) + 1
      
      if (row.postcode) {
        stats.postcodes[row.postcode] = (stats.postcodes[row.postcode] || 0) + 1
        
        // Map postcode to location
        const location = getLocationFromPostcode(row.postcode)
        stats.locations[location] = (stats.locations[location] || 0) + 1
      }
      
      if (row.medical_conditions) {
        row.medical_conditions.forEach((condition: string) => {
          if (condition) {
            // Handle "Other:" conditions
            if (condition.startsWith('Other:')) {
              stats.disabilities['Other'] = (stats.disabilities['Other'] || 0) + 1
            } else {
              // Preserve the full condition name including diagnosis status
              stats.disabilities[condition] = (stats.disabilities[condition] || 0) + 1
            }
          }
        })
      }
    })
    
    return {
      month,
      year,
      stats
    }
  }
  
  static async delete(id: number): Promise<void> {
    const pool = getPool()
    const query = 'DELETE FROM attendance WHERE id = $1'
    await pool.query(query, [id])
  }

  static async getWeeklyAttendanceCount(): Promise<number> {
    const pool = getPool()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const query = `
      SELECT COUNT(DISTINCT member_id) as count
      FROM attendance
      WHERE date >= $1 AND present = true
    `
    
    const result = await pool.query(query, [oneWeekAgo])
    return parseInt(result.rows[0].count) || 0
  }

  static async getMonthlyAttendanceCount(): Promise<number> {
    const pool = getPool()
    const oneMonthAgo = new Date()
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)
    
    const query = `
      SELECT COUNT(DISTINCT member_id) as count
      FROM attendance
      WHERE date >= $1 AND present = true
    `
    
    const result = await pool.query(query, [oneMonthAgo])
    return parseInt(result.rows[0].count) || 0
  }

  static async getNewMembersThisMonth(): Promise<number> {
    const pool = getPool()
    const oneMonthAgo = new Date()
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)
    
    const query = `
      SELECT COUNT(*) as count
      FROM members
      WHERE created_at >= $1
    `
    
    const result = await pool.query(query, [oneMonthAgo])
    return parseInt(result.rows[0].count) || 0
  }

  static async getAttendanceCount(startDate: Date, endDate: Date): Promise<number> {
    const pool = getPool()
    const query = `
      SELECT COUNT(DISTINCT member_id) as count
      FROM attendance
      WHERE date >= $1 AND date <= $2 AND present = true
    `
    
    const result = await pool.query(query, [startDate, endDate])
    return parseInt(result.rows[0].count) || 0
  }

  static async getNewMembersCount(startDate: Date, endDate: Date): Promise<number> {
    const pool = getPool()
    const query = `
      SELECT COUNT(*) as count
      FROM members
      WHERE created_at >= $1 AND created_at <= $2
    `
    
    const result = await pool.query(query, [startDate, endDate])
    return parseInt(result.rows[0].count) || 0
  }
}