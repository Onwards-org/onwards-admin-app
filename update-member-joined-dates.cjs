const { Pool } = require('pg');
require('dotenv').config();

// Database connection setup using the same configuration as the app
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

async function updateMemberJoinedDates() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Updating member joined dates to submission date (June 13, 2025)...');
    
    // Set the submission date to June 13, 2025
    const submissionDate = new Date('2025-06-13T00:00:00.000Z');
    
    // Get all members first to see what we're updating
    const membersResult = await client.query('SELECT id, name, created_at FROM members ORDER BY id');
    const members = membersResult.rows;
    
    console.log(`📊 Found ${members.length} members to update`);
    console.log('Current dates:');
    members.forEach(member => {
      console.log(`  - ${member.name} (ID: ${member.id}): ${member.created_at}`);
    });
    
    // Update all member created_at dates to the submission date
    const updateQuery = `
      UPDATE members 
      SET created_at = $1, updated_at = $1
      WHERE id = ANY($2)
    `;
    
    const memberIds = members.map(m => m.id);
    
    const result = await client.query(updateQuery, [submissionDate, memberIds]);
    
    console.log(`✅ Successfully updated ${result.rowCount} member joined dates to June 13, 2025`);
    
    // Verify the update
    const verifyResult = await client.query('SELECT id, name, created_at FROM members ORDER BY id LIMIT 5');
    console.log('\nVerification - First 5 members:');
    verifyResult.rows.forEach(member => {
      console.log(`  - ${member.name} (ID: ${member.id}): ${member.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating member joined dates:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
updateMemberJoinedDates()
  .then(() => {
    console.log('🎉 Member joined dates update completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to update member joined dates:', error);
    process.exit(1);
  });