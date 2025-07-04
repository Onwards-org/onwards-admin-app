const { Pool } = require('pg');
require('dotenv').config();

// Database connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

async function testSessionCancellation() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing session cancellation functionality...');
    
    // Cancel the session on May 30, 2025 (which has the least attendees - 10)
    const testDate = new Date('2025-05-30');
    const cancellationReason = 'Testing the cancellation feature - staff illness';
    const cancelledBy = 'Test Admin';
    
    console.log(`\n📅 Cancelling session for ${testDate.toLocaleDateString()}...`);
    
    // Cancel the session
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
    
    const cancelResult = await client.query(cancelQuery, [testDate, cancellationReason, cancelledBy]);
    console.log('✅ Session cancelled successfully');
    
    // Verify the cancellation
    const verifyQuery = 'SELECT * FROM sessions WHERE date = $1';
    const verifyResult = await client.query(verifyQuery, [testDate]);
    const session = verifyResult.rows[0];
    
    console.log('\n🔍 Session details:');
    console.log(`  - Date: ${new Date(session.date).toLocaleDateString()}`);
    console.log(`  - Status: ${session.status}`);
    console.log(`  - Reason: ${session.cancellation_reason}`);
    console.log(`  - Cancelled by: ${session.cancelled_by}`);
    console.log(`  - Cancelled at: ${new Date(session.cancelled_at).toLocaleString()}`);
    
    // Check attendance for that date
    const attendanceQuery = `
      SELECT COUNT(*) as total_attendance, COUNT(*) FILTER (WHERE present = true) as present_count
      FROM attendance 
      WHERE date = $1
    `;
    const attendanceResult = await client.query(attendanceQuery, [testDate]);
    const attendance = attendanceResult.rows[0];
    
    console.log('\n📊 Attendance for cancelled session:');
    console.log(`  - Total attendance records: ${attendance.total_attendance}`);
    console.log(`  - Members marked present: ${attendance.present_count}`);
    
    console.log('\n✅ Test completed! You can now:');
    console.log('1. Go to the Attendance page in the admin interface');
    console.log('2. Select the date: May 30, 2025');
    console.log('3. You should see the red cancellation notice above the member list');
    console.log('4. The notice will show the reason and who cancelled it');
    
    console.log('\n💡 To revert this test, the session can be marked as "held" again through the UI or database');
    
  } catch (error) {
    console.error('❌ Error testing session cancellation:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
testSessionCancellation()
  .then(() => {
    console.log('\n🎉 Session cancellation test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to test session cancellation:', error);
    process.exit(1);
  });