import { getPool } from './database.js'
import type { Session } from '../../shared/types.js'

export class SessionModel {
  static async create(date: Date, status: 'scheduled' | 'held' | 'cancelled' = 'scheduled'): Promise<Session> {
    const pool = getPool()
    const query = `
      INSERT INTO sessions (date, status)
      VALUES ($1, $2)
      ON CONFLICT (date) 
      DO UPDATE SET status = $2
      RETURNING *
    `
    
    const result = await pool.query(query, [date, status])
    return result.rows[0]
  }
  
  static async getByDate(date: Date): Promise<Session | null> {
    const pool = getPool()
    const query = 'SELECT * FROM sessions WHERE date = $1'
    const result = await pool.query(query, [date])
    
    return result.rows[0] || null
  }
  
  static async cancelSession(
    date: Date, 
    cancellationReason: string, 
    cancelledBy: string
  ): Promise<Session> {
    const pool = getPool()
    const query = `
      INSERT INTO sessions (date, status, cancellation_reason, cancelled_by, cancelled_at)
      VALUES ($1, 'cancelled', $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (date) 
      DO UPDATE SET 
        status = 'cancelled',
        cancellation_reason = $2,
        cancelled_by = $3,
        cancelled_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    
    const result = await pool.query(query, [date, cancellationReason, cancelledBy])
    return result.rows[0]
  }
  
  static async markAsHeld(date: Date): Promise<Session> {
    const pool = getPool()
    const query = `
      INSERT INTO sessions (date, status)
      VALUES ($1, 'held')
      ON CONFLICT (date) 
      DO UPDATE SET 
        status = 'held',
        cancellation_reason = NULL,
        cancelled_by = NULL,
        cancelled_at = NULL
      RETURNING *
    `
    
    const result = await pool.query(query, [date])
    return result.rows[0]
  }
  
  static async list(startDate?: Date, endDate?: Date): Promise<Session[]> {
    const pool = getPool()
    let query = 'SELECT * FROM sessions'
    const params: any[] = []
    
    if (startDate) {
      query += ` WHERE date >= $${params.length + 1}`
      params.push(startDate)
    }
    
    if (endDate) {
      const operator = startDate ? 'AND' : 'WHERE'
      query += ` ${operator} date <= $${params.length + 1}`
      params.push(endDate)
    }
    
    query += ' ORDER BY date DESC'
    
    const result = await pool.query(query, params)
    return result.rows
  }

  static async removeCancellation(date: Date): Promise<Session> {
    const pool = getPool()
    const query = `
      UPDATE sessions 
      SET 
        status = 'scheduled',
        cancellation_reason = NULL,
        cancelled_by = NULL,
        cancelled_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE date = $1
      RETURNING *
    `
    
    const result = await pool.query(query, [date])
    return result.rows[0]
  }
}