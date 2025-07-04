#!/usr/bin/env node

/**
 * Test date construction for June 2025
 */

console.log('🗓️  Testing Date Construction for June 2025\n')

const month = 6  // June
const year = 2025

// Fixed date construction using UTC
const startDate = new Date(Date.UTC(year, month - 1, 1))
const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

console.log('📅 Date Range for June 2025:')
console.log(`Start Date: ${startDate}`)
console.log(`End Date: ${endDate}`)
console.log(`Start Date ISO: ${startDate.toISOString()}`)
console.log(`End Date ISO: ${endDate.toISOString()}`)
console.log(`Start Date SQL format: ${startDate.toISOString().split('T')[0]}`)
console.log(`End Date SQL format: ${endDate.toISOString().split('T')[0]}`)

console.log('\n🎯 Expected Range:')
console.log('Should include: 2025-06-01 to 2025-06-30')

console.log('\n📊 Current Date Info:')
const now = new Date()
console.log(`Today: ${now.toISOString().split('T')[0]}`)
console.log(`Today is in June 2025 range: ${now >= startDate && now <= endDate ? '✅ YES' : '❌ NO'}`)

// Test if today's date would be captured
const todayDate = now.toISOString().split('T')[0]
console.log(`\n🧪 If attendance was recorded today (${todayDate}):`)

// Simulate database date comparison
const testAttendanceDate = new Date(todayDate + 'T12:00:00.000Z')
const wouldBeIncluded = testAttendanceDate >= startDate && testAttendanceDate <= endDate
console.log(`Would be included in June 2025 report: ${wouldBeIncluded ? '✅ YES' : '❌ NO'}`)

if (!wouldBeIncluded) {
  console.log('\n⚠️  This explains why current attendance data is not showing in June 2025 reports!')
  
  // Check what month/year today actually falls into
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  console.log(`\n📍 Today's date falls into: ${currentMonth}/${currentYear}`)
  console.log(`You should generate a report for: ${currentMonth}/${currentYear}`)
}