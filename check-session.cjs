const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

async function checkSession() {
  try {
    const result = await pool.query(`
      SELECT * FROM sessions WHERE status = 'cancelled' ORDER BY date DESC LIMIT 5
    `);
    
    console.log('Cancelled sessions:', result.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSession();