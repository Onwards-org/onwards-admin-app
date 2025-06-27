import { getPool } from './database.js'
import bcrypt from 'bcryptjs'
import type { User } from '../../shared/types.js'

export class UserModel {
  static async create(username: string, password: string): Promise<User> {
    const pool = getPool()
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    const query = `
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      RETURNING id, username, password_hash, created_at, updated_at
    `
    
    const result = await pool.query(query, [username, passwordHash])
    return result.rows[0]
  }
  
  static async findByUsername(username: string): Promise<User | null> {
    const pool = getPool()
    const query = 'SELECT * FROM users WHERE username = $1'
    const result = await pool.query(query, [username])
    
    return result.rows[0] || null
  }
  
  static async findById(id: number): Promise<User | null> {
    const pool = getPool()
    const query = 'SELECT * FROM users WHERE id = $1'
    const result = await pool.query(query, [id])
    
    return result.rows[0] || null
  }
  
  static async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username)
    if (!user) return null
    
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return null
    
    return user
  }
  
  static async updatePassword(id: number, newPassword: string): Promise<void> {
    const pool = getPool()
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(newPassword, saltRounds)
    
    const query = 'UPDATE users SET password_hash = $1 WHERE id = $2'
    await pool.query(query, [passwordHash, id])
  }
  
  static async delete(id: number): Promise<void> {
    const pool = getPool()
    const query = 'DELETE FROM users WHERE id = $1'
    await pool.query(query, [id])
  }
  
  static async list(): Promise<Omit<User, 'password_hash'>[]> {
    const pool = getPool()
    const query = 'SELECT id, username, created_at, updated_at FROM users ORDER BY created_at ASC'
    const result = await pool.query(query)
    
    return result.rows
  }
  
  static async count(): Promise<number> {
    const pool = getPool()
    const query = 'SELECT COUNT(*) as count FROM users'
    const result = await pool.query(query)
    
    return parseInt(result.rows[0].count)
  }
}