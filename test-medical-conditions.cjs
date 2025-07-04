const { Pool } = require('pg');
require('dotenv/config');

async function testMedicalConditions() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('=== CURRENT MEDICAL CONDITIONS DATA ===\n');
    
    // Get all medical conditions grouped by type
    const result = await pool.query(`
      SELECT condition, COUNT(*) as count 
      FROM medical_conditions 
      GROUP BY condition 
      ORDER BY count DESC, condition
    `);
    
    console.log('Medical Conditions Breakdown:');
    result.rows.forEach(row => {
      console.log(`  ${row.condition.padEnd(35)} | ${row.count} member(s)`);
    });
    
    console.log(`\nTotal conditions: ${result.rows.length}`);
    console.log(`Total entries: ${result.rows.reduce((sum, row) => sum + parseInt(row.count), 0)}`);
    
    // Get members with detailed conditions (our test member)
    const detailedResult = await pool.query(`
      SELECT m.name, mc.condition 
      FROM members m 
      JOIN medical_conditions mc ON m.id = mc.member_id 
      WHERE mc.condition LIKE '%(%'
      ORDER BY m.name, mc.condition
    `);
    
    if (detailedResult.rows.length > 0) {
      console.log('\n=== MEMBERS WITH DETAILED DIAGNOSIS STATUS ===\n');
      let currentMember = '';
      detailedResult.rows.forEach(row => {
        if (row.name !== currentMember) {
          currentMember = row.name;
          console.log(`${row.name}:`);
        }
        console.log(`  - ${row.condition}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testMedicalConditions();