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
    const query = `
      SELECT 
        m.id,
        m.name,
        COALESCE(a.present, false) as present
      FROM members m
      LEFT JOIN attendance a ON m.id = a.member_id AND a.date = $1
      ORDER BY m.name
    `
    
    const result = await pool.query(query, [date])
    return result.rows
  }
  
  static async generateMonthlyReport(month: number, year: number): Promise<AttendanceReport> {
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
    
    // Postcode to location mapping for West Midlands area
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
      
      // Streetly (part of Sutton Coldfield)
      if (postcodeUpper.startsWith('B74') && (postcodeUpper.includes('1') || postcodeUpper.includes('2') || postcodeUpper.includes('3'))) {
        return 'Streetly'
      }
      
      // Sutton Coldfield
      if (postcodeUpper.startsWith('B72') || postcodeUpper.startsWith('B73') || 
          postcodeUpper.startsWith('B74') || postcodeUpper.startsWith('B75') || 
          postcodeUpper.startsWith('B76')) {
        return 'Sutton Coldfield'
      }
      
      // Kingstanding
      if (postcodeUpper.startsWith('B44') || 
          (postcodeUpper.startsWith('B43') && postcodeUpper.includes('6'))) {
        return 'Kingstanding'
      }
      
      // Erdington
      if (postcodeUpper.startsWith('B23') || postcodeUpper.startsWith('B24')) {
        return 'Erdington'
      }
      
      // Boldmere
      if (postcodeUpper.startsWith('B73') && (postcodeUpper.includes('5') || postcodeUpper.includes('6'))) {
        return 'Boldmere'
      }
      
      // Great Barr
      if (postcodeUpper.startsWith('B43') || postcodeUpper.startsWith('B42')) {
        return 'Great Barr'
      }
      
      // Handsworth
      if (postcodeUpper.startsWith('B20') || postcodeUpper.startsWith('B21')) {
        return 'Handsworth'
      }
      
      // Birmingham City Centre
      if (postcodeUpper.startsWith('B1') || postcodeUpper.startsWith('B2') || 
          postcodeUpper.startsWith('B3') || postcodeUpper.startsWith('B4') || 
          postcodeUpper.startsWith('B5')) {
        return 'Birmingham City Centre'
      }
      
      // Other Birmingham areas
      if (postcodeUpper.startsWith('B')) {
        return 'Birmingham (Other)'
      }
      
      // Tamworth
      if (postcodeUpper.startsWith('B77') || postcodeUpper.startsWith('B78') || 
          postcodeUpper.startsWith('B79')) {
        return 'Tamworth'
      }
      
      return 'Other'
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
          stats.disabilities[condition] = (stats.disabilities[condition] || 0) + 1
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