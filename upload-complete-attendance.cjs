const { Pool } = require('pg');
require('dotenv').config();

// Database connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('db.onwards.org.uk') ? { rejectUnauthorized: false } : false
});

// Complete attendance data
const attendanceData = `06/06/2025 20:38:47        Clare Ogrady
06/06/2025 20:38:47        Lottie Ogrady
06/06/2025 20:38:47        Gemma Lewis 
06/06/2025 20:38:47        Ellie Faris
06/06/2025 20:38:47        Darwin Yardley
06/06/2025 20:38:47        Keith Yardley
09/05/2025 20:38:47        Lorna Denyard
16/05/2025 14:05:26        Vincent Price
02/05/2025 18:55:13        Suzanne Grice
02/05/2025 18:55:25        Andrew Grice
02/05/2025 18:55:44        Evie Grice
02/05/2025 19:07:58        Lucy Needham
02/05/2025 19:08:14        Emma Needham
02/05/2025 19:08:32        Molly Needham
02/05/2025 20:44:15        Syon Ghosh Bhatt
02/05/2025 20:44:26        Karen Ghosh
02/05/2025 20:44:47        Keira Surch
02/05/2025 20:45:16        Sue Surch
02/05/2025 20:45:39        AJ Keeler
02/05/2025 20:45:54        Lesley Keeler
02/05/2025 20:46:11        Benjamin Wright
02/05/2025 20:47:06        Arlo Lloyd
02/05/2025 20:47:21        Jay Lloyd
02/05/2025 20:47:53        Dhillan Capewell-Green
02/05/2025 20:48:13        Kelly Green
02/05/2025 20:48:28        Mike Green
09/05/2025 20:25:12        Emma Needham
09/05/2025 20:25:25        Molly Needham
09/05/2025 20:25:42        Paige Howard
09/05/2025 20:25:53        Hayley Howard
09/05/2025 20:26:02        Lucy Needham
09/05/2025 20:26:43        Suzanne Grice
09/05/2025 20:27:01        Andrew Grice
09/05/2025 20:27:37        Evie Grice
09/05/2025 20:29:10        Heather Armitage
09/05/2025 20:29:17        Bethany Armitage
09/05/2025 20:32:28        Imraun shah
09/05/2025 20:33:39        AJ Keeler
09/05/2025 20:33:59        Lesley Keeler
09/05/2025 20:34:23        Sue Smith
09/05/2025 20:34:42        Keira Surch
09/05/2025 20:34:59        Sue Surch
09/05/2025 20:35:18        Lia Audrey
09/05/2025 20:35:45        Rebekah Thomas
09/05/2025 20:36:05        Vincent Price
09/05/2025 20:36:16        Benjamin alexander Price
09/05/2025 20:36:30        Samuel gordon Price
09/05/2025 20:36:38        Arlo Lloyd
09/05/2025 20:36:50        Jay Lloyd
09/05/2025 20:36:59        Benjamin Wright
09/05/2025 20:37:09        John Wright
09/05/2025 20:37:22        Karen Ghosh
09/05/2025 20:37:36        Syon Ghosh Bhatt
09/05/2025 20:37:51        Kelly Green
09/05/2025 20:38:06        Mike Green
09/05/2025 20:38:15        Dhillan Capewell-Green
16/05/2025 14:05:26        Andrew Grice
16/05/2025 14:05:26        Evie Grice
16/05/2025 14:05:26        Suzanne Grice
16/05/2025 14:05:26        AJ Keeler
16/05/2025 14:05:26        Lesley Keeler
16/05/2025 14:05:26        Arlo Lloyd
16/05/2025 14:05:26        Jay Lloyd
16/05/2025 14:05:26        Hayley Howard
16/05/2025 14:05:26        Paige Howard
16/05/2025 14:05:26        Karen Ghosh
16/05/2025 14:05:26        Syon Ghosh Bhatt
16/05/2025 14:05:26        Benjamin Wright
16/05/2025 14:05:26        John Wright
16/05/2025 14:05:26        Benjamin alexander Price
16/05/2025 14:05:26        Isabella Ellison
16/05/2025 14:05:26        Leah Ellison
23/05/2025 19:17:48        Andrew Grice
23/05/2025 19:18:03        Suzanne Grice
23/05/2025 19:18:11        Evie Grice
23/05/2025 19:19:17        Rebekah Thomas
23/05/2025 19:19:52        Lia Audrey
23/05/2025 19:20:09        Leah Ellison
23/05/2025 19:20:18        Isabella Ellison
23/05/2025 19:20:35        Sue Surch
23/05/2025 19:20:53        Keira Surch
23/05/2025 19:21:07        Jo Harley
23/05/2025 19:21:18        Ky Harley
23/05/2025 19:21:28        Emma Needham
23/05/2025 19:21:53        Lucy Needham
23/05/2025 19:22:10        Molly Needham
23/05/2025 19:22:28        Hayley Howard
23/05/2025 19:23:00        Paige Howard
23/05/2025 19:25:00        Karen Ghosh
23/05/2025 19:25:14        Syon Ghosh Bhatt
23/05/2025 19:25:42        Vincent Price
23/05/2025 19:25:49        Benjamin alexander Price
23/05/2025 19:26:01        Mary Brown
23/05/2025 19:26:09        Iris Brown
30/05/2025 22:55:09        Andrew Grice
30/05/2025 22:55:23        Evie Grice
30/05/2025 22:55:37        Suzanne Grice
30/05/2025 22:55:55        Keira Surch
30/05/2025 22:56:14        Sue Surch
30/05/2025 22:57:05        Ky Harley
30/05/2025 22:57:54        Neil Harley
30/05/2025 22:58:14        Benjamin alexander Price
30/05/2025 22:58:24        Samuel gordon Price
30/05/2025 22:58:34        Vincent Price
06/06/2025 19:52:11        Andrew Grice
06/06/2025 19:52:23        Evie Grice
06/06/2025 19:52:37        Suzanne Grice
06/06/2025 19:53:45        Bethany Armitage
06/06/2025 19:53:52        Heather Armitage
06/06/2025 19:54:06        Keira Surch
06/06/2025 19:54:19        Sue Surch
06/06/2025 19:54:29        Vincent Price
06/06/2025 19:54:47        Samuel gordon Price
06/06/2025 19:54:57        Benjamin alexander Price
06/06/2025 19:55:55        Leah Ellison
06/06/2025 19:56:04        Isabella Ellison
06/06/2025 19:56:21        Jo Harley
06/06/2025 19:56:31        Ky Harley
06/06/2025 19:56:42        Benjamin Wright
06/06/2025 19:57:03        Lorna Denyard
06/06/2025 19:57:18        Karen Ghosh
06/06/2025 19:57:29        Syon Ghosh Bhatt
06/06/2025 19:57:45        Kelly Green
06/06/2025 19:57:55        Mike Green
06/06/2025 19:58:04        Dhillan Capewell-Green
06/06/2025 19:58:17        Arlo Lloyd
06/06/2025 19:58:32        Jay Lloyd
06/06/2025 19:58:53        Hayley Howard
06/06/2025 19:59:04        Paige Howard
06/06/2025 19:59:28        Iris Brown
06/06/2025 19:59:39        Mary Brown
06/06/2025 19:59:55        AJ Keeler
06/06/2025 20:00:07        Lesley Keeler
06/06/2025 20:00:23        Jake Buckland
06/06/2025 20:00:37        Louise Buckland
14/06/2025 20:11:53        Evie Grice
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

function parseCompleteAttendanceData() {
  const lines = attendanceData.trim().split('\n');
  const records = [];
  
  for (const line of lines) {
    if (line.trim()) {
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
  }
  
  return records;
}

async function uploadCompleteAttendanceData() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Deleting all existing attendance records...');
    
    // Delete all existing attendance records
    const deleteResult = await client.query('DELETE FROM attendance');
    console.log(`✅ Deleted ${deleteResult.rowCount} existing attendance records`);
    
    console.log('\n📊 Parsing complete attendance data...');
    const records = parseCompleteAttendanceData();
    console.log(`Found ${records.length} total attendance records to insert`);
    
    // Group by date for summary
    const dateGroups = {};
    records.forEach(record => {
      if (!dateGroups[record.dateStr]) {
        dateGroups[record.dateStr] = [];
      }
      dateGroups[record.dateStr].push(record.name);
    });
    
    console.log(`\nAttendance sessions found:`);
    Object.keys(dateGroups).sort().forEach(date => {
      console.log(`  - ${date}: ${dateGroups[date].length} attendees`);
    });
    
    console.log('\n💾 Inserting attendance records...');
    
    let insertedCount = 0;
    let notFoundCount = 0;
    const notFoundNames = new Set();
    
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
          // Handle "Imraun shah" vs "Imran shah"
          else if (record.name === 'Imraun shah') {
            memberResult = await client.query(findQuery, ['Imran shah']);
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
          
          if (insertedCount <= 10) {
            console.log(`  ✅ ${record.name} - ${record.dateStr}`);
          } else if (insertedCount === 11) {
            console.log(`  ... continuing to add more records ...`);
          }
        } else {
          if (!notFoundNames.has(record.name)) {
            console.log(`  ⚠️  Member not found: ${record.name}`);
            notFoundNames.add(record.name);
          }
          notFoundCount++;
        }
      } catch (error) {
        console.error(`  ❌ Error inserting ${record.name}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${insertedCount} attendance records`);
    if (notFoundCount > 0) {
      console.log(`⚠️  ${notFoundCount} attendance entries for members not found in database`);
      console.log(`   Unique members not found: ${notFoundNames.size}`);
    }
    
    // Final verification
    const verifyQuery = `
      SELECT COUNT(*) as total_records,
             COUNT(DISTINCT member_id) as unique_members,
             COUNT(DISTINCT date) as unique_dates
      FROM attendance
    `;
    const verifyResult = await client.query(verifyQuery);
    const stats = verifyResult.rows[0];
    
    console.log('\n🔍 Final Summary:');
    console.log(`  - Total attendance records: ${stats.total_records}`);
    console.log(`  - Unique members tracked: ${stats.unique_members}`);
    console.log(`  - Unique session dates: ${stats.unique_dates}`);
    
    // Show final attendance by date
    const finalDateQuery = `
      SELECT date, COUNT(*) as attendance_count
      FROM attendance
      GROUP BY date
      ORDER BY date
    `;
    const finalDateResult = await client.query(finalDateQuery);
    
    console.log('\nFinal attendance by date:');
    finalDateResult.rows.forEach(row => {
      const dateStr = new Date(row.date).toLocaleDateString();
      console.log(`  - ${dateStr}: ${row.attendance_count} attendees`);
    });
    
  } catch (error) {
    console.error('❌ Error uploading complete attendance data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the upload
uploadCompleteAttendanceData()
  .then(() => {
    console.log('\n🎉 Complete attendance data upload completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to upload complete attendance data:', error);
    process.exit(1);
  });