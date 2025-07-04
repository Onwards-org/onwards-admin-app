const { Pool } = require('pg');
require('dotenv').config();

// Database connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

async function addSessionsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding sessions table to track cancelled sessions...');
    
    // Create sessions table to track session status and cancellation info
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'held', 'cancelled')),
        cancellation_reason TEXT,
        cancelled_by VARCHAR(255),
        cancelled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    console.log('✅ Sessions table created successfully');
    
    // Create index for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);');
    console.log('✅ Index created for sessions table');
    
    // Add trigger for updated_at
    await client.query(`
      DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
      CREATE TRIGGER update_sessions_updated_at 
        BEFORE UPDATE ON sessions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Trigger created for sessions table');
    
    // Insert existing session dates from attendance data as 'held' sessions
    const insertExistingSessionsQuery = `
      INSERT INTO sessions (date, status)
      SELECT DISTINCT date, 'held' as status
      FROM attendance
      WHERE date NOT IN (SELECT date FROM sessions)
      ORDER BY date;
    `;
    
    const result = await client.query(insertExistingSessionsQuery);
    console.log(`✅ Added ${result.rowCount} existing sessions from attendance data`);
    
    // Verify the sessions table
    const verifyQuery = 'SELECT date, status FROM sessions ORDER BY date';
    const verifyResult = await client.query(verifyQuery);
    
    console.log('\n📅 Current sessions in database:');
    verifyResult.rows.forEach(row => {
      const dateStr = new Date(row.date).toLocaleDateString();
      console.log(`  - ${dateStr}: ${row.status}`);
    });
    
    console.log(`\n📊 Total sessions tracked: ${verifyResult.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error adding sessions table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
addSessionsTable()
  .then(() => {
    console.log('\n🎉 Sessions table setup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to add sessions table:', error);
    process.exit(1);
  });