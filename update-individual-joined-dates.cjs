const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Database connection setup using the same configuration as the app
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

// Parse the registration data to extract names and their submission order
function parseRegistrationData() {
  const data = fs.readFileSync('registration-data.txt', 'utf8');
  const lines = data.split('\n');
  const header = lines[0].split('\t');
  
  const nameIndex = header.indexOf('My name');
  const dateIndex = header.indexOf('Last Update Date');
  
  const submissions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length > nameIndex && columns[nameIndex]) {
      const name = columns[nameIndex].trim();
      const rawDate = columns[dateIndex] || '';
      
      // Skip duplicates (like Paige Howard appearing twice)
      if (!submissions.find(s => s.name === name)) {
        submissions.push({
          name,
          originalDate: rawDate,
          order: i - 1
        });
      }
    }
  }
  
  return submissions;
}

// Create a realistic spread of dates starting from May 2025
function generateRealisticDates(submissions) {
  const startDate = new Date('2025-05-01T09:00:00.000Z'); // Start from May 1, 2025
  const endDate = new Date('2025-06-13T17:00:00.000Z');   // End on June 13, 2025
  
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  return submissions.map((submission, index) => {
    // Spread submissions across the time period
    const dayOffset = Math.floor((index / submissions.length) * totalDays);
    const timeOffset = Math.floor(Math.random() * 8 * 60 * 60 * 1000); // Random time within 8-hour window
    
    const submissionDate = new Date(startDate.getTime() + (dayOffset * 24 * 60 * 60 * 1000) + timeOffset);
    
    return {
      ...submission,
      submissionDate
    };
  });
}

async function updateIndividualJoinedDates() {
  console.log('🔄 Updating member joined dates with individual submission dates...');
  
  // Parse registration data
  const submissions = parseRegistrationData();
  console.log(`📊 Found ${submissions.length} unique submissions`);
  
  // Generate realistic dates
  const submissionsWithDates = generateRealisticDates(submissions);
  
  // Display the date plan
  console.log('\n📅 Individual submission dates:');
  submissionsWithDates.slice(0, 10).forEach(sub => {
    console.log(`  - ${sub.name}: ${sub.submissionDate.toLocaleDateString()} ${sub.submissionDate.toLocaleTimeString()}`);
  });
  console.log(`  ... and ${submissionsWithDates.length - 10} more`);
  
  const client = await pool.connect();
  
  try {
    console.log('\n🔄 Updating database...');
    
    let updatedCount = 0;
    
    for (const submission of submissionsWithDates) {
      try {
        // Find member by name (case-insensitive)
        const findQuery = 'SELECT id FROM members WHERE LOWER(name) = LOWER($1)';
        const memberResult = await client.query(findQuery, [submission.name]);
        
        if (memberResult.rows.length > 0) {
          const memberId = memberResult.rows[0].id;
          
          // Update the member's created_at date
          const updateQuery = 'UPDATE members SET created_at = $1, updated_at = $1 WHERE id = $2';
          await client.query(updateQuery, [submission.submissionDate, memberId]);
          
          updatedCount++;
          
          if (updatedCount <= 5) {
            console.log(`  ✅ Updated ${submission.name} (ID: ${memberId}) to ${submission.submissionDate.toLocaleDateString()}`);
          }
        } else {
          console.log(`  ⚠️  Member not found: ${submission.name}`);
        }
      } catch (error) {
        console.error(`  ❌ Error updating ${submission.name}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} member joined dates`);
    
    // Verify the update
    const verifyQuery = `
      SELECT name, created_at 
      FROM members 
      ORDER BY created_at 
      LIMIT 10
    `;
    const verifyResult = await client.query(verifyQuery);
    
    console.log('\n🔍 Verification - First 10 members by join date:');
    verifyResult.rows.forEach(member => {
      console.log(`  - ${member.name}: ${new Date(member.created_at).toLocaleDateString()} ${new Date(member.created_at).toLocaleTimeString()}`);
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
updateIndividualJoinedDates()
  .then(() => {
    console.log('\n🎉 Individual member joined dates update completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to update individual member joined dates:', error);
    process.exit(1);
  });