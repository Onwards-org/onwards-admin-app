// Test different date formats to understand the issue

console.log('🔍 Testing date format conversions...\n');

// Test the format you used
const userInput = '20/06/25';
console.log(`User input: "${userInput}"`);

// HTML date input expects YYYY-MM-DD format
const correctFormat = '2025-06-20';
console.log(`Correct HTML date format: "${correctFormat}"`);

// Test conversion
const testDate = new Date('2025-06-20');
console.log(`Date object from correct format: ${testDate}`);
console.log(`ISO string: ${testDate.toISOString()}`);
console.log(`Date only: ${testDate.toISOString().split('T')[0]}`);

console.log('\n📅 Summary:');
console.log('- The HTML date picker requires YYYY-MM-DD format');
console.log('- Your search "20/06/25" might not be recognized');
console.log('- Try using "2025-06-20" instead');

console.log('\n🎯 To test the cancellation feature:');
console.log('1. Go to the Attendance page');
console.log('2. Use the date picker to select June 20, 2025');
console.log('3. Or manually type "2025-06-20" in the date field');
console.log('4. Click "Search"');
console.log('5. You should see the red cancellation notice');

console.log('\n📋 Known cancelled sessions:');
console.log('- May 30, 2025 (2025-05-30)');
console.log('- June 20, 2025 (2025-06-20)');

console.log('\n✅ Both should show cancellation notices when searched with proper date format.');