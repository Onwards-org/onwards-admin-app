#!/usr/bin/env node

/**
 * Debug script to check what attendance data exists in the database
 */

require('dotenv/config')
const { Pool } = require('pg')

async function debugAttendanceData() {
  console.log('🔍 Debugging Attendance Data in Database\n')
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
  })

  try {
    // Check all attendance records
    console.log('📊 All attendance records in database:')
    const allAttendance = await pool.query(`
      SELECT a.id, a.member_id, a.date, a.present, m.name 
      FROM attendance a 
      JOIN members m ON a.member_id = m.id 
      ORDER BY a.date DESC 
      LIMIT 20
    `)
    
    if (allAttendance.rows.length === 0) {
      console.log('❌ No attendance records found in database!')
    } else {
      console.log(`✅ Found ${allAttendance.rows.length} attendance records:`)
      allAttendance.rows.forEach(row => {
        console.log(`  ${row.date} - ${row.name} (ID: ${row.member_id}) - ${row.present ? 'Present' : 'Absent'}`)
      })
    }

    // Check attendance for June 2025 specifically
    console.log('\n📅 Attendance records for June 2025:')
    const startDate = new Date(Date.UTC(2025, 5, 1)) // June 1, 2025
    const endDate = new Date(Date.UTC(2025, 5, 30, 23, 59, 59, 999)) // June 30, 2025
    
    const juneAttendance = await pool.query(`
      SELECT a.id, a.member_id, a.date, a.present, m.name 
      FROM attendance a 
      JOIN members m ON a.member_id = m.id 
      WHERE a.date >= $1 AND a.date <= $2 AND a.present = true
      ORDER BY a.date DESC
    `, [startDate, endDate])
    
    if (juneAttendance.rows.length === 0) {
      console.log('❌ No attendance records found for June 2025!')
      console.log(`   Date range searched: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`)
    } else {
      console.log(`✅ Found ${juneAttendance.rows.length} attendance records for June 2025:`)
      juneAttendance.rows.forEach(row => {
        console.log(`  ${row.date} - ${row.name} (ID: ${row.member_id})`)
      })
    }

    // Check members table
    console.log('\n👥 Total members in database:')
    const memberCount = await pool.query('SELECT COUNT(*) FROM members')
    console.log(`   Total members: ${memberCount.rows[0].count}`)

    // Test the exact query from the report generation
    console.log('\n🧪 Testing exact report generation query for June 2025:')
    const reportQuery = `
      SELECT DISTINCT
        m.id,
        m.name,
        m.gender,
        m.birth_year,
        m.ethnicity,
        m.sexual_orientation,
        m.employment_status,
        COALESCE(m.postcode, SUBSTRING(m.address FROM '[A-Z]{1,2}[0-9]{1,2}[A-Z]?')) as postcode
      FROM members m
      INNER JOIN attendance a ON m.id = a.member_id
      WHERE a.date >= $1 AND a.date <= $2 AND a.present = true
      GROUP BY m.id, m.name, m.gender, m.birth_year, m.ethnicity, m.sexual_orientation, m.employment_status, m.postcode, m.address
    `
    
    const reportResult = await pool.query(reportQuery, [startDate, endDate])
    console.log(`   Query returned ${reportResult.rows.length} members`)
    
    if (reportResult.rows.length > 0) {
      console.log('   Members found:')
      reportResult.rows.forEach(row => {
        console.log(`     ${row.name} (ID: ${row.id})`)
      })
    }

  } catch (error) {
    console.error('💥 Database error:', error.message)
  } finally {
    await pool.end()
  }
}

debugAttendanceData()