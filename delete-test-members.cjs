const { Pool } = require('pg');
require('dotenv/config');

async function deleteTestMembers() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  
  try {
    console.log('🔍 Searching for test members...');
    
    // First, let's find all potential test members
    const findTestMembersQuery = `
      SELECT id, name, email, phone 
      FROM members 
      WHERE 
        name ILIKE '%test%' OR 
        email ILIKE '%test%' OR 
        email ILIKE '%example.com%' OR
        phone = '07123456789' OR
        name ILIKE '%Test User%'
      ORDER BY id
    `;
    
    const testMembersResult = await client.query(findTestMembersQuery);
    const testMembers = testMembersResult.rows;
    
    if (testMembers.length === 0) {
      console.log('✅ No test members found.');
      return;
    }
    
    console.log(`\n📋 Found ${testMembers.length} potential test member(s):`);
    testMembers.forEach((member, index) => {
      console.log(`${index + 1}. ID: ${member.id}, Name: "${member.name}", Email: "${member.email}", Phone: "${member.phone}"`);
    });
    
    console.log('\n🗑️ Deleting test members...');
    
    await client.query('BEGIN');
    
    let deletedCount = 0;
    
    for (const member of testMembers) {
      try {
        // Delete related records first (foreign key constraints)
        await client.query('DELETE FROM emergency_contacts WHERE member_id = $1', [member.id]);
        await client.query('DELETE FROM medical_conditions WHERE member_id = $1', [member.id]);
        await client.query('DELETE FROM challenging_behaviours WHERE member_id = $1', [member.id]);
        await client.query('DELETE FROM attendance WHERE member_id = $1', [member.id]);
        
        // Delete the member
        await client.query('DELETE FROM members WHERE id = $1', [member.id]);
        
        console.log(`✅ Deleted: ${member.name} (ID: ${member.id})`);
        deletedCount++;
        
      } catch (error) {
        console.error(`❌ Error deleting member ${member.name} (ID: ${member.id}):`, error.message);
      }
    }
    
    await client.query('COMMIT');
    
    console.log(`\n🎉 Successfully deleted ${deletedCount} test member(s).`);
    
    // Verify deletion
    const verifyQuery = `
      SELECT COUNT(*) as count 
      FROM members 
      WHERE 
        name ILIKE '%test%' OR 
        email ILIKE '%test%' OR 
        email ILIKE '%example.com%' OR
        phone = '07123456789' OR
        name ILIKE '%Test User%'
    `;
    
    const verifyResult = await client.query(verifyQuery);
    const remainingTestMembers = parseInt(verifyResult.rows[0].count);
    
    if (remainingTestMembers === 0) {
      console.log('✅ Verification: No test members remain in the database.');
    } else {
      console.log(`⚠️ Warning: ${remainingTestMembers} test member(s) still exist in the database.`);
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during test member deletion:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

deleteTestMembers().catch(console.error);