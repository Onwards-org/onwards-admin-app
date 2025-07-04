const { Pool } = require('pg');
require('dotenv').config();

// Database connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

async function testDirectApi() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing what the API should return...\n');
    
    // Test both cancelled dates
    const testDates = [
      { date: '2025-05-30', name: 'May 30, 2025' },
      { date: '2025-06-20', name: 'June 20, 2025' }
    ];
    
    for (const testDate of testDates) {
      console.log(`\n📅 Testing ${testDate.name} (${testDate.date}):`);
      
      const date = new Date(testDate.date);
      
      // Get session data
      const sessionQuery = 'SELECT * FROM sessions WHERE date = $1';
      const sessionResult = await client.query(sessionQuery, [date]);
      
      // Get members data (simulating the API)
      const membersQuery = `
        SELECT 
          m.id,
          m.name,
          COALESCE(a.present, false) as present
        FROM members m
        LEFT JOIN attendance a ON m.id = a.member_id AND a.date = $1
        ORDER BY m.name
        LIMIT 5
      `;
      const membersResult = await client.query(membersQuery, [date]);
      
      console.log(`  Session found: ${sessionResult.rows.length > 0 ? 'YES' : 'NO'}`);
      
      if (sessionResult.rows.length > 0) {
        const session = sessionResult.rows[0];
        console.log(`  Status: ${session.status}`);
        console.log(`  Cancellation reason: ${session.cancellation_reason || 'N/A'}`);
        console.log(`  Cancelled by: ${session.cancelled_by || 'N/A'}`);
        
        // This is what the API should return
        const apiResponse = {
          members: membersResult.rows,
          session: session
        };
        
        console.log(`  Members count: ${membersResult.rows.length}`);
        console.log(`  API would return session.status: '${session.status}'`);
        console.log(`  UI condition (session && session.status === 'cancelled'): ${!!(session && session.status === 'cancelled')}`);
      } else {
        console.log(`  ❌ No session record found!`);
      }
    }
    
    // Let's also check the server setup
    console.log('\n🔧 Checking server setup...');
    
    // Verify the Session model import path
    console.log('  SessionModel import should be: ../models/Session.js');
    
    // Check if the route is properly updated
    console.log('  API endpoint: /api/attendance/members-for-date/:date');
    console.log('  Should return: { members: [...], session: {...} }');
    
    // Test the exact API logic
    console.log('\n🧪 Simulating exact API logic for 2025-06-20:');
    
    const testApiDate = new Date('2025-06-20');
    
    const [members, session] = await Promise.all([
      client.query(`
        SELECT 
          m.id,
          m.name,
          COALESCE(a.present, false) as present
        FROM members m
        LEFT JOIN attendance a ON m.id = a.member_id AND a.date = $1
        ORDER BY m.name
      `, [testApiDate]),
      client.query('SELECT * FROM sessions WHERE date = $1', [testApiDate])
    ]);
    
    const apiResponseSimulation = {
      members: members.rows,
      session: session.rows[0] || null
    };
    
    console.log('  API Response Simulation:');
    console.log(`    members.length: ${apiResponseSimulation.members.length}`);
    console.log(`    session: ${apiResponseSimulation.session ? 'EXISTS' : 'NULL'}`);
    if (apiResponseSimulation.session) {
      console.log(`    session.status: '${apiResponseSimulation.session.status}'`);
      console.log(`    session.cancellation_reason: '${apiResponseSimulation.session.cancellation_reason}'`);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testDirectApi()
  .then(() => {
    console.log('\n🎯 If sessions exist but UI not showing cancellation notice, the issue might be:');
    console.log('  1. Frontend not properly importing Session type');
    console.log('  2. API response format mismatch'); 
    console.log('  3. Vue reactivity issue');
    console.log('  4. Server needs restart after model changes');
    console.log('\n💡 Try restarting the development server!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });