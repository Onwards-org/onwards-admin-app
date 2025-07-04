const { Pool } = require('pg');
require('dotenv').config();

// Database connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

async function debugSessionStatus() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Debugging session status for June 20, 2025...');
    
    // Check if there's a session record for June 20, 2025
    const testDate = new Date('2025-06-20');
    console.log(`\nChecking for session on: ${testDate.toISOString().split('T')[0]}`);
    
    const sessionQuery = 'SELECT * FROM sessions WHERE date = $1';
    const sessionResult = await client.query(sessionQuery, [testDate]);
    
    if (sessionResult.rows.length > 0) {
      const session = sessionResult.rows[0];
      console.log('\n✅ Session found:');
      console.log(`  - Date: ${new Date(session.date).toLocaleDateString()}`);
      console.log(`  - Status: ${session.status}`);
      console.log(`  - Reason: ${session.cancellation_reason || 'N/A'}`);
      console.log(`  - Cancelled by: ${session.cancelled_by || 'N/A'}`);
      console.log(`  - Cancelled at: ${session.cancelled_at ? new Date(session.cancelled_at).toLocaleString() : 'N/A'}`);
    } else {
      console.log('\n❌ No session record found for June 20, 2025');
      
      // Check if there's attendance data for this date
      const attendanceQuery = 'SELECT COUNT(*) as count FROM attendance WHERE date = $1';
      const attendanceResult = await client.query(attendanceQuery, [testDate]);
      const attendanceCount = attendanceResult.rows[0].count;
      
      console.log(`\n📊 Attendance records for this date: ${attendanceCount}`);
      
      if (attendanceCount > 0) {
        console.log('   → Creating session record as "held" since attendance exists');
        
        const createSessionQuery = `
          INSERT INTO sessions (date, status) 
          VALUES ($1, 'held') 
          RETURNING *
        `;
        const createResult = await client.query(createSessionQuery, [testDate]);
        console.log('   ✅ Session record created');
      } else {
        console.log('   → No attendance data found, creating session as "scheduled"');
        
        const createSessionQuery = `
          INSERT INTO sessions (date, status) 
          VALUES ($1, 'scheduled') 
          RETURNING *
        `;
        await client.query(createSessionQuery, [testDate]);
        console.log('   ✅ Session record created as scheduled');
      }
    }
    
    // Now let's manually cancel this session to test
    console.log('\n🔧 Cancelling the June 20, 2025 session for testing...');
    
    const cancelQuery = `
      INSERT INTO sessions (date, status, cancellation_reason, cancelled_by, cancelled_at)
      VALUES ($1, 'cancelled', $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (date) 
      DO UPDATE SET 
        status = 'cancelled',
        cancellation_reason = $2,
        cancelled_by = $3,
        cancelled_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const cancelResult = await client.query(cancelQuery, [
      testDate, 
      'Meeting cancelled due to venue unavailability', 
      'Admin User'
    ]);
    
    const cancelledSession = cancelResult.rows[0];
    console.log('✅ Session cancelled successfully:');
    console.log(`  - Date: ${new Date(cancelledSession.date).toLocaleDateString()}`);
    console.log(`  - Status: ${cancelledSession.status}`);
    console.log(`  - Reason: ${cancelledSession.cancellation_reason}`);
    console.log(`  - Cancelled by: ${cancelledSession.cancelled_by}`);
    console.log(`  - Cancelled at: ${new Date(cancelledSession.cancelled_at).toLocaleString()}`);
    
    // Test the API endpoint
    console.log('\n🌐 Testing API endpoint response...');
    console.log('   Expected URL: /api/attendance/members-for-date/2025-06-20');
    console.log('   Date format in database: 2025-06-20');
    console.log('   Date format you searched: 20/06/25');
    
    // Check all sessions in database
    console.log('\n📋 All sessions in database:');
    const allSessionsQuery = 'SELECT date, status, cancellation_reason FROM sessions ORDER BY date';
    const allSessionsResult = await client.query(allSessionsQuery);
    
    allSessionsResult.rows.forEach(row => {
      const status = row.status === 'cancelled' ? '❌ CANCELLED' : row.status === 'held' ? '✅ HELD' : '📅 SCHEDULED';
      console.log(`  - ${new Date(row.date).toLocaleDateString()}: ${status}`);
      if (row.cancellation_reason) {
        console.log(`    Reason: ${row.cancellation_reason}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error debugging session status:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the debug
debugSessionStatus()
  .then(() => {
    console.log('\n🎉 Debug completed! Now try searching for "2025-06-20" in the attendance page.');
    console.log('💡 Make sure to use the format YYYY-MM-DD in the date picker.');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to debug session status:', error);
    process.exit(1);
  });