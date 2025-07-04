const { Pool } = require('pg');
require('dotenv/config');

async function updateEvieGrice() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Updating Evie Grice medical conditions...');
    
    // First, delete existing medical conditions for Evie Grice (ID 10)
    await client.query('DELETE FROM medical_conditions WHERE member_id = 10');
    console.log('✅ Cleared existing medical conditions');
    
    // Add new detailed medical conditions
    const newConditions = [
      'Autism (Diagnosed)',
      'ADHD (Diagnosed)', 
      'Post-traumatic stress disorder (PTSD)',
      'Anxiety (Diagnosed)',
      'Depression'
    ];
    
    for (const condition of newConditions) {
      await client.query(
        'INSERT INTO medical_conditions (member_id, condition) VALUES ($1, $2)',
        [10, condition]
      );
      console.log(`✅ Added: ${condition}`);
    }
    
    await client.query('COMMIT');
    console.log('\\n✅ Evie Grice medical conditions updated successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating Evie Grice:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateEvieGrice();