// Direct database test to verify medical conditions logic
const { Pool } = require('pg');
require('dotenv/config');

async function testReportLogic() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Replicate the exact query from Member.ts
    const monthNum = 6;
    const yearNum = 2025;
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    
    const query = `
      SELECT 
        m.id,
        m.gender,
        m.birth_year,
        m.ethnicity,
        m.sexual_orientation,
        m.employment_status,
        COALESCE(m.postcode, SUBSTRING(m.address FROM '[A-Z]{1,2}[0-9]{1,2}[A-Z]?')) as postcode,
        array_agg(DISTINCT mc.condition) FILTER (WHERE mc.condition IS NOT NULL) as medical_conditions
      FROM members m
      INNER JOIN attendance a ON m.id = a.member_id
      LEFT JOIN medical_conditions mc ON m.id = mc.member_id
      WHERE a.date >= $1 AND a.date <= $2 AND a.present = true
      GROUP BY m.id, m.gender, m.birth_year, m.ethnicity, m.sexual_orientation, m.employment_status, m.postcode, m.address
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    
    console.log('=== REPORT GENERATION TEST ===\\n');
    console.log(`Query found ${result.rows.length} members who attended in ${monthNum}/${yearNum}\\n`);
    
    // Process medical conditions like the updated code should
    const medicalConditionsBreakdown = {};
    
    result.rows.forEach((member) => {
      console.log(`Member ${member.id}: ${member.medical_conditions?.join(', ') || 'No conditions'}`);
      
      // Medical conditions breakdown - preserve detailed diagnosis status
      if (member.medical_conditions && Array.isArray(member.medical_conditions)) {
        member.medical_conditions.forEach((condition) => {
          if (condition) {
            // Handle "Other:" conditions
            if (condition.startsWith('Other:')) {
              medicalConditionsBreakdown['Other'] = (medicalConditionsBreakdown['Other'] || 0) + 1;
            } else {
              // Preserve the full condition name including diagnosis status
              medicalConditionsBreakdown[condition] = (medicalConditionsBreakdown[condition] || 0) + 1;
            }
          }
        });
      }
    });
    
    console.log('\\n=== MEDICAL CONDITIONS BREAKDOWN (UPDATED LOGIC) ===\\n');
    Object.entries(medicalConditionsBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([condition, count]) => {
        console.log(`  ${condition.padEnd(35)} | ${count}`);
      });
      
    console.log(`\\nTotal unique conditions: ${Object.keys(medicalConditionsBreakdown).length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testReportLogic();