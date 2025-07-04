#!/usr/bin/env node

/**
 * Debug script to check member demographic data that might be causing empty reports
 */

require('dotenv/config')
const { Pool } = require('pg')

async function debugMemberDemographics() {
  console.log('🔍 Debugging Member Demographics for Report Generation\n')
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
  })

  try {
    // Check the demographic data for attendees
    console.log('👥 Demographic data for June 2025 attendees:')
    const startDate = new Date(Date.UTC(2025, 5, 1))
    const endDate = new Date(Date.UTC(2025, 5, 30, 23, 59, 59, 999))
    
    const demographicsQuery = `
      SELECT DISTINCT
        m.id,
        m.name,
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
      GROUP BY m.id, m.name, m.gender, m.birth_year, m.ethnicity, m.sexual_orientation, m.employment_status, m.postcode, m.address
      ORDER BY m.name
    `
    
    const result = await pool.query(demographicsQuery, [startDate, endDate])
    
    console.log(`📊 Found ${result.rows.length} members with demographic data:`)
    
    let hasEmptyFields = false
    
    result.rows.forEach(row => {
      console.log(`\n👤 ${row.name} (ID: ${row.id}):`)
      console.log(`   Gender: ${row.gender || '❌ EMPTY'}`)
      console.log(`   Birth Year: ${row.birth_year || '❌ EMPTY'}`)
      console.log(`   Ethnicity: ${row.ethnicity || '❌ EMPTY'}`)
      console.log(`   Sexual Orientation: ${row.sexual_orientation || '❌ EMPTY'}`)
      console.log(`   Employment: ${row.employment_status || '❌ EMPTY'}`)
      console.log(`   Postcode: ${row.postcode || '❌ EMPTY'}`)
      console.log(`   Medical Conditions: ${row.medical_conditions ? row.medical_conditions.join(', ') : '❌ EMPTY'}`)
      
      // Check for empty required fields
      if (!row.gender || !row.birth_year || !row.ethnicity || !row.sexual_orientation || !row.employment_status) {
        hasEmptyFields = true
        console.log(`   ⚠️  HAS EMPTY REQUIRED FIELDS`)
      }
    })
    
    if (hasEmptyFields) {
      console.log('\n🚨 ISSUE FOUND: Some members have empty demographic fields!')
      console.log('   This could cause the report aggregation to fail or return empty results.')
      console.log('   Members need complete demographic data for reports to work properly.')
    } else {
      console.log('\n✅ All members have complete demographic data.')
    }
    
    // Test the aggregation logic manually
    console.log('\n🧮 Testing manual aggregation:')
    const stats = {
      genders: {},
      ethnicities: {},
      employment_status: {}
    }
    
    result.rows.forEach(row => {
      if (row.gender) {
        stats.genders[row.gender] = (stats.genders[row.gender] || 0) + 1
      }
      if (row.ethnicity) {
        stats.ethnicities[row.ethnicity] = (stats.ethnicities[row.ethnicity] || 0) + 1
      }
      if (row.employment_status) {
        stats.employment_status[row.employment_status] = (stats.employment_status[row.employment_status] || 0) + 1
      }
    })
    
    console.log('   Gender breakdown:', stats.genders)
    console.log('   Ethnicity breakdown:', stats.ethnicities)
    console.log('   Employment breakdown:', stats.employment_status)
    
    const totalStats = Object.keys(stats.genders).length + Object.keys(stats.ethnicities).length + Object.keys(stats.employment_status).length
    
    if (totalStats === 0) {
      console.log('❌ No stats generated - this explains the empty report!')
    } else {
      console.log(`✅ Generated stats for ${totalStats} categories`)
    }

  } catch (error) {
    console.error('💥 Database error:', error.message)
  } finally {
    await pool.end()
  }
}

debugMemberDemographics()