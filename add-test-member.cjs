const { Pool } = require('pg');
require('dotenv/config');

async function addTestMember() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Add a test member with detailed medical conditions
    const memberQuery = `
      INSERT INTO members (
        name, phone, email, address, postcode, birth_month, birth_year,
        employment_status, ethnicity, religion, gender, sexual_orientation,
        transgender_status, hobbies_interests, pregnancy_maternity,
        additional_health_info, privacy_accepted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id
    `;
    
    const memberResult = await client.query(memberQuery, [
      'Test User (Detailed Conditions)', 
      '07123456789', 
      'test@example.com', 
      '123 Test Street, Birmingham', 
      'B1 1AA', 
      6, 
      1995,
      'Part-time employment', 
      'White - British', 
      'No religion', 
      'Male', 
      'Heterosexual/Straight',
      'No', 
      'Testing, Reading', 
      'No', 
      'Test user for detailed medical conditions', 
      true
    ]);
    
    const memberId = memberResult.rows[0].id;
    console.log(`Added test member with ID: ${memberId}`);
    
    // Add detailed medical conditions
    const conditions = [
      'ADHD (diagnosed)',
      'Autism (self-diagnosed)', 
      'Anxiety (awaiting diagnosis)',
      'Depression (diagnosed)'
    ];
    
    for (const condition of conditions) {
      await client.query(
        'INSERT INTO medical_conditions (member_id, condition) VALUES ($1, $2)',
        [memberId, condition]
      );
      console.log(`Added condition: ${condition}`);
    }
    
    await client.query('COMMIT');
    console.log('✅ Test member added successfully with detailed medical conditions');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding test member:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addTestMember();