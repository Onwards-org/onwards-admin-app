#!/usr/bin/env node

/**
 * Debug script to check date handling for June 2024
 */

// Test the date construction logic
console.log('🗓️  Date Construction Debug for June 2024\n')

const month = 6  // June
const year = 2024

// This is how the code currently constructs dates
const startDate = new Date(year, month - 1, 1)  // June 1, 2024
const endDate = new Date(year, month, 0)        // Last day of June 2024

console.log('📅 Constructed Date Range:')
console.log(`Start Date: ${startDate}`)
console.log(`End Date: ${endDate}`)
console.log(`Start Date ISO: ${startDate.toISOString()}`)
console.log(`End Date ISO: ${endDate.toISOString()}`)
console.log(`Start Date SQL format: ${startDate.toISOString().split('T')[0]}`)
console.log(`End Date SQL format: ${endDate.toISOString().split('T')[0]}`)

console.log('\n🎯 Expected Range:')
console.log('Should include: 2024-06-01 to 2024-06-30')

console.log('\n⚠️  Timezone Information:')
console.log(`Local timezone offset: ${startDate.getTimezoneOffset()} minutes`)
console.log(`Local timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)

// Test some sample dates that should be in June
const testDates = [
  '2024-06-01',
  '2024-06-15', 
  '2024-06-30',
  '2024-05-31',  // Should be excluded
  '2024-07-01'   // Should be excluded
]

console.log('\n🧪 Test Dates:')
testDates.forEach(dateStr => {
  const testDate = new Date(dateStr)
  const inRange = testDate >= startDate && testDate <= endDate
  console.log(`${dateStr}: ${inRange ? '✅ IN RANGE' : '❌ OUT OF RANGE'}`)
})

// Check what happens with attendance dates from today
console.log('\n📊 If attendance was recorded today:')
const today = new Date()
const todayInJune = today >= startDate && today <= endDate
console.log(`Today (${today.toISOString().split('T')[0]}): ${todayInJune ? '✅ Would be included' : '❌ Would be excluded'}`)