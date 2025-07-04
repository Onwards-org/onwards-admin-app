const { Pool } = require('pg');
require('dotenv').config();

// Database connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

// Attendance data to insert
const attendanceData = `14/06/2025 20:11:53        Evie Grice
14/06/2025 20:12:06        Andrew Grice
14/06/2025 20:12:16        Suzanne Grice
14/06/2025 20:12:36        Alex Bowen
14/06/2025 20:12:55        Sarah Bowen
14/06/2025 20:13:15        AJ Keeler
14/06/2025 20:13:26        Lesley Keeler
14/06/2025 20:14:04        Heather Armitage
14/06/2025 20:14:15        Bethany Armitage
14/06/2025 20:14:27        Keira Surch
14/06/2025 20:14:41        Sue Surch
14/06/2025 20:14:57        Benjamin alexander Price
14/06/2025 20:15:18        Samuel gordon Price
14/06/2025 20:18:30        Darnia Hamid
14/06/2025 20:18:40        Iram Hamid
14/06/2025 20:19:02        Lia Audrey
14/06/2025 20:19:12        Rebekah Thomas
14/06/2025 20:19:30        Arlo Lloyd
14/06/2025 20:19:45        Jay Lloyd
14/06/2025 20:20:02        Hayley Howard
14/06/2025 20:20:12        Paige Howard
14/06/2025 20:22:40        Karen Ghosh
14/06/2025 20:23:00        Syon Ghosh Bhatt
14/06/2025 20:23:29        Jake Buckland
14/06/2025 20:23:43        Louise Buckland
14/06/2025 20:24:16        Louise Buckland
14/06/2025 20:25:02        Ellie Faris
14/06/2025 20:25:09        Gemma lewis
14/06/2025 20:26:01        Clare Ogrady
14/06/2025 20:26:07        Lottie Ogrady
14/06/2025 20:26:27        Darwin Yardley
14/06/2025 20:26:36        Keith Yardley
27/06/2025 23:06:16        Andrew Grice
27/06/2025 23:06:27        Evie Grice
27/06/2025 23:06:42        Suzanne Grice
27/06/2025 23:06:55        Hayley Howard
27/06/2025 23:07:07        Paige Howard
27/06/2025 23:07:40        Sue Surch
27/06/2025 23:07:52        Keira Surch
27/06/2025 23:08:06        Benjamin alexander Price
27/06/2025 23:08:17        Samuel gordon Price
27/06/2025 23:08:58        Clare Ogrady
27/06/2025 23:09:22        Lottie Ogrady
27/06/2025 23:09:44        Gemma lewis
27/06/2025 23:09:51        Ellie Faris
27/06/2025 23:10:07        Benjamin Wright
27/06/2025 23:10:17        Lorna Denyard
27/06/2025 23:10:35        Karen Ghosh
27/06/2025 23:10:46        Syon Ghosh Bhatt
27/06/2025 23:13:46        Jake Buckland
27/06/2025 23:14:03        Louise Buckland
27/06/2025 23:14:18        Darwin Yardley
27/06/2025 23:14:31        Keith Yardley
27/06/2025 23:14:51        Ky Harley
27/06/2025 23:15:02        Jo Harley`;

function parseAttendanceData() {
  const lines = attendanceData.trim().split('\n');
  const records = [];
  
  for (const line of lines) {
    const parts = line.trim().split(/\s{2,}/); // Split on multiple spaces
    if (parts.length >= 2) {
      const dateTimeStr = parts[0].trim();
      const name = parts[1].trim();
      
      // Parse the date from DD/MM/YYYY HH:MM:SS format
      const [datePart, timePart] = dateTimeStr.split(' ');
      const [day, month, year] = datePart.split('/');
      
      // Create proper date object (month is 0-indexed in JS)
      const attendanceDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      records.push({
        name,
        date: attendanceDate,
        dateStr: attendanceDate.toISOString().split('T')[0] // YYYY-MM-DD format
      });
    }
  }
  
  return records;
}

async function updateAttendanceRecords() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Deleting all existing attendance records...');
    
    // Delete all existing attendance records
    const deleteResult = await client.query('DELETE FROM attendance');
    console.log(`✅ Deleted ${deleteResult.rowCount} existing attendance records`);
    
    console.log('\n📊 Parsing new attendance data...');
    const records = parseAttendanceData();
    console.log(`Found ${records.length} attendance records to insert`);
    
    // Show a few examples
    console.log('\nFirst 3 records:');
    records.slice(0, 3).forEach(record => {
      console.log(`  - ${record.name} on ${record.dateStr}`);
    });
    
    console.log('\n💾 Inserting new attendance records...');
    
    let insertedCount = 0;
    let notFoundCount = 0;
    
    for (const record of records) {
      try {
        // Find member by name (case-insensitive, handle variations)
        let findQuery = 'SELECT id FROM members WHERE LOWER(name) = LOWER($1)';
        let memberResult = await client.query(findQuery, [record.name]);
        
        // If not found, try some name variations
        if (memberResult.rows.length === 0) {
          // Handle "Darnia Hamid" vs "Dania HAMID"
          if (record.name === 'Darnia Hamid') {
            memberResult = await client.query(findQuery, ['Dania HAMID']);
          }
          // Handle "Gemma lewis" vs "Gemma Lewis"
          else if (record.name === 'Gemma lewis') {
            memberResult = await client.query(findQuery, ['Gemma Lewis']);
          }
          // Handle "Clare Ogrady" vs "clare Ogrady"
          else if (record.name === 'Clare Ogrady') {
            memberResult = await client.query(findQuery, ['clare Ogrady']);
          }
          // Handle "Lottie Ogrady" vs "lottie Ogrady"
          else if (record.name === 'Lottie Ogrady') {
            memberResult = await client.query(findQuery, ['lottie Ogrady']);
          }
        }
        
        if (memberResult.rows.length > 0) {
          const memberId = memberResult.rows[0].id;
          
          // Insert attendance record
          const insertQuery = `
            INSERT INTO attendance (member_id, date, present) 
            VALUES ($1, $2, $3)
            ON CONFLICT (member_id, date) DO UPDATE SET present = $3
          `;
          
          await client.query(insertQuery, [memberId, record.date, true]);
          insertedCount++;
          
          if (insertedCount <= 5) {
            console.log(`  ✅ Added ${record.name} (ID: ${memberId}) for ${record.dateStr}`);
          }
        } else {
          console.log(`  ⚠️  Member not found: ${record.name}`);
          notFoundCount++;
        }
      } catch (error) {
        console.error(`  ❌ Error inserting ${record.name}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${insertedCount} attendance records`);
    if (notFoundCount > 0) {
      console.log(`⚠️  ${notFoundCount} members not found in database`);
    }
    
    // Verify the results
    const verifyQuery = `
      SELECT COUNT(*) as total_records,
             COUNT(DISTINCT member_id) as unique_members,
             COUNT(DISTINCT date) as unique_dates
      FROM attendance
    `;
    const verifyResult = await client.query(verifyQuery);
    const stats = verifyResult.rows[0];
    
    console.log('\n🔍 Verification:');
    console.log(`  - Total attendance records: ${stats.total_records}`);
    console.log(`  - Unique members: ${stats.unique_members}`);
    console.log(`  - Unique dates: ${stats.unique_dates}`);
    
    // Show attendance by date
    const dateQuery = `
      SELECT date, COUNT(*) as attendance_count
      FROM attendance
      GROUP BY date
      ORDER BY date
    `;
    const dateResult = await client.query(dateQuery);
    
    console.log('\nAttendance by date:');
    dateResult.rows.forEach(row => {
      const dateStr = new Date(row.date).toLocaleDateString();
      console.log(`  - ${dateStr}: ${row.attendance_count} attendees`);
    });
    
  } catch (error) {
    console.error('❌ Error updating attendance records:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
updateAttendanceRecords()
  .then(() => {
    console.log('\n🎉 Attendance records update completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to update attendance records:', error);
    process.exit(1);
  });