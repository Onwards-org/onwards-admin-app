const { Pool } = require('pg');
require('dotenv/config');

async function addTestAttendance() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Find our test member with detailed conditions
    const memberResult = await pool.query(
      "SELECT id FROM members WHERE name = 'Test User (Detailed Conditions)'"
    );
    
    if (memberResult.rows.length === 0) {
      console.log('Test member not found');
      return;
    }
    
    const memberId = memberResult.rows[0].id;
    console.log(`Found test member with ID: ${memberId}`);
    
    // Add attendance records for June 2025
    const attendanceDates = [
      '2025-06-05',
      '2025-06-12', 
      '2025-06-19',
      '2025-06-26'
    ];
    
    for (const date of attendanceDates) {
      try {
        await pool.query(
          'INSERT INTO attendance (member_id, date, present) VALUES ($1, $2, $3)',
          [memberId, date, true]
        );
        console.log(`Added attendance for ${date}`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`Attendance for ${date} already exists`);
        } else {
          console.error(`Error adding attendance for ${date}:`, error.message);
        }
      }
    }
    
    console.log('✅ Test member attendance added');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

addTestAttendance();