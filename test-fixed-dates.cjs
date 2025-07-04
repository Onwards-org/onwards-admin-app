#!/usr/bin/env node

/**
 * Test the fixed date construction for June 2024
 */

console.log('🔧 Testing Fixed Date Construction for June 2024\n')

const month = 6  // June
const year = 2024

// Fixed date construction using UTC
const startDate = new Date(Date.UTC(year, month - 1, 1))
const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

console.log('📅 Fixed Date Range:')
console.log(`Start Date: ${startDate}`)
console.log(`End Date: ${endDate}`)
console.log(`Start Date ISO: ${startDate.toISOString()}`)
console.log(`End Date ISO: ${endDate.toISOString()}`)
console.log(`Start Date SQL format: ${startDate.toISOString().split('T')[0]}`)
console.log(`End Date SQL format: ${endDate.toISOString().split('T')[0]}`)

console.log('\n🎯 Expected Range:')
console.log('Should include: 2024-06-01 to 2024-06-30')

// Test the same dates again
const testDates = [
  '2024-06-01',
  '2024-06-15', 
  '2024-06-30',
  '2024-05-31',  // Should be excluded
  '2024-07-01'   // Should be excluded
]

console.log('\n🧪 Test Dates with Fixed Logic:')
testDates.forEach(dateStr => {
  const testDate = new Date(dateStr + 'T12:00:00.000Z') // Noon UTC to avoid edge cases
  const inRange = testDate >= startDate && testDate <= endDate
  console.log(`${dateStr}: ${inRange ? '✅ IN RANGE' : '❌ OUT OF RANGE'}`)
})

console.log('\n✅ This should now properly include all of June 2024!')