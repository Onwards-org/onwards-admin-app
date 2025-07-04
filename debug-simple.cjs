const { Pool } = require('pg');
require('dotenv').config();

async function checkMedicalConditions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Check all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    console.log('All tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  ${row.table_name}`);
    });
    
    console.log('\n');
    
    // Check if there's a medical_conditions table
    const medicalQuery = `
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name LIKE '%medical%' OR table_name LIKE '%condition%' OR table_name LIKE '%disabilit%'
      ORDER BY table_name, ordinal_position
    `;
    
    const medicalResult = await pool.query(medicalQuery);
    console.log('Medical/condition related tables:');
    medicalResult.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name}: ${row.data_type}`);
    });
    
    // Check users table
    const usersQuery = `
      SELECT id, username, created_at
      FROM users 
      ORDER BY created_at
    `;
    
    const usersResult = await pool.query(usersQuery);
    console.log('\nUsers in database:');
    usersResult.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.username} (created: ${row.created_at})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkMedicalConditions();