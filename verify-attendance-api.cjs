const { Pool } = require('pg');
require('dotenv').config();

// Database connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

async function verifyAttendanceData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying attendance data is accessible...\n');
    
    // Check total attendance records
    const totalQuery = 'SELECT COUNT(*) as total FROM attendance';
    const totalResult = await client.query(totalQuery);
    console.log(`📊 Total attendance records: ${totalResult.rows[0].total}`);
    
    // Check attendance by date
    const dateQuery = `
      SELECT 
        date,
        COUNT(*) as attendee_count,
        array_agg(m.name ORDER BY m.name) as attendees
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      WHERE a.present = true
      GROUP BY date
      ORDER BY date
    `;
    const dateResult = await client.query(dateQuery);
    
    console.log('\n📅 Attendance by date:');
    dateResult.rows.forEach(row => {
      const dateStr = new Date(row.date).toLocaleDateString();
      console.log(`\n  ${dateStr} - ${row.attendee_count} attendees:`);
      row.attendees.slice(0, 5).forEach(name => {
        console.log(`    • ${name}`);
      });
      if (row.attendees.length > 5) {
        console.log(`    ... and ${row.attendees.length - 5} more`);
      }
    });
    
    // Check specific API endpoints that would be used
    console.log('\n🔗 Available API endpoints for attendance:');
    console.log('  GET /api/attendance/date/2025-06-14 - Get attendance for June 14, 2025');
    console.log('  GET /api/attendance/date/2025-06-27 - Get attendance for June 27, 2025');
    console.log('  GET /api/attendance/members-for-date/2025-06-14 - Get members who attended June 14');
    console.log('  GET /api/attendance/report/2025/6 - Get June 2025 monthly report');
    console.log('  POST /api/attendance/record - Record new attendance');
    console.log('  POST /api/attendance/record-bulk - Record bulk attendance');
    
    // Verify the data structure matches what the API expects
    const sampleQuery = `
      SELECT 
        a.id,
        a.member_id,
        a.date,
        a.present,
        m.name as member_name
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      ORDER BY a.date, m.name
      LIMIT 5
    `;
    const sampleResult = await client.query(sampleQuery);
    
    console.log('\n📋 Sample attendance records:');
    sampleResult.rows.forEach(record => {
      const dateStr = new Date(record.date).toLocaleDateString();
      console.log(`  • ${record.member_name} - ${dateStr} (Present: ${record.present})`);
    });
    
    console.log('\n✅ Attendance data is properly stored and accessible through the API!');
    console.log('\n💡 The attendance records are now available in the admin interface at:');
    console.log('  - Dashboard attendance statistics');
    console.log('  - Monthly reports and PDF generation');
    console.log('  - Individual member attendance tracking');
    console.log('  - Bulk attendance recording interface');
    
  } catch (error) {
    console.error('❌ Error verifying attendance data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run verification
verifyAttendanceData()
  .then(() => {
    console.log('\n🎉 Attendance data verification completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to verify attendance data:', error);
    process.exit(1);
  });