const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

async function updateCancellationReason() {
  try {
    const result = await pool.query(`
      UPDATE sessions 
      SET cancellation_reason = 'too hot'
      WHERE id = 10 AND status = 'cancelled'
      RETURNING *
    `);
    
    console.log('Updated session:', result.rows[0]);
  } catch (error) {
    console.error('Error updating cancellation reason:', error);
  } finally {
    await pool.end();
  }
}

updateCancellationReason();