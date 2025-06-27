import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

let pool: Pool

export const initDatabase = (connectionString?: string) => {
  pool = new Pool({
    connectionString: connectionString || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
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
    console.log('Could not create/verify tables (this is ok if tables already exist):', (error as any).message)
  }

  // Run migrations for existing installations
  try {
    await (await client).query('ALTER TABLE members ADD COLUMN IF NOT EXISTS postcode VARCHAR(20);')
    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Error running migrations:', error)
  } finally {
    (await client).release()
  }
}