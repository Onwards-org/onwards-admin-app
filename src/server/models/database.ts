import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

let pool: Pool

export const initDatabase = (connectionString?: string) => {
  pool = new Pool({
    connectionString: connectionString || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })
  
  return pool
}

export const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase first.')
  }
  return pool
}

export const createTables = async () => {
  const schemaPath = path.join(process.cwd(), 'src/server/models/schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  
  const client = pool.connect()
  try {
    await (await client).query(schema)
    console.log('Database tables created successfully')
  } catch (error) {
    console.error('Error creating database tables:', error)
    throw error
  } finally {
    (await client).release()
  }
}