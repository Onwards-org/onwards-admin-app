const { AttendanceModel } = require('./src/server/models/Attendance.js');

async function testMedicalConditions() {
  try {
    const report = await AttendanceModel.generateMonthlyReport(6, 2025);
    console.log('Medical conditions data:');
    console.log(JSON.stringify(report.stats.disabilities, null, 2));
    
    // Test the processing function
    const processedMedicalConditions = (data) => {
      const totals = {}
      const stacked = {}
      
      Object.entries(data).forEach(([condition, count]) => {
        const lowerCondition = condition.toLowerCase()
        console.log(`Processing: "${condition}" (${count}) -> lowercase: "${lowerCondition}"`)
        
        // Check for autism variants
        if (lowerCondition.includes('autism')) {
          console.log('  -> Detected as autism variant')
          if (!totals['Autism']) totals['Autism'] = 0
          if (!stacked['Autism']) stacked['Autism'] = { 'diagnosed': 0, 'self diagnosed': 0, 'awaiting diagnosis': 0 }
          
          totals['Autism'] += count
          if (lowerCondition.includes('(diagnosed)')) {
            stacked['Autism']['diagnosed'] += count
            console.log('    -> Diagnosed')
          }
          else if (lowerCondition.includes('(self diagnosed)')) {
            stacked['Autism']['self diagnosed'] += count
            console.log('    -> Self diagnosed')
          }
          else if (lowerCondition.includes('(awaiting diagnosis)')) {
            stacked['Autism']['awaiting diagnosis'] += count
            console.log('    -> Awaiting diagnosis')
          }
          else {
            stacked['Autism']['diagnosed'] += count
            console.log('    -> Default to diagnosed')
          }
        }
        // Check for ADHD variants
        else if (lowerCondition.includes('adhd')) {
          console.log('  -> Detected as ADHD variant')
          if (!totals['ADHD']) totals['ADHD'] = 0
          if (!stacked['ADHD']) stacked['ADHD'] = { 'diagnosed': 0, 'self diagnosed': 0, 'awaiting diagnosis': 0 }
          
          totals['ADHD'] += count
          if (lowerCondition.includes('(diagnosed)')) {
            stacked['ADHD']['diagnosed'] += count
            console.log('    -> Diagnosed')
          }
          else if (lowerCondition.includes('(self diagnosed)')) {
            stacked['ADHD']['self diagnosed'] += count
            console.log('    -> Self diagnosed')
          }
          else if (lowerCondition.includes('(awaiting diagnosis)')) {
            stacked['ADHD']['awaiting diagnosis'] += count
            console.log('    -> Awaiting diagnosis')
          }
          else {
            stacked['ADHD']['diagnosed'] += count
            console.log('    -> Default to diagnosed')
          }
        }
        // Check for anxiety variants
        else if (lowerCondition.includes('anxiety')) {
          console.log('  -> Detected as anxiety variant')
          if (!totals['Anxiety']) totals['Anxiety'] = 0
          if (!stacked['Anxiety']) stacked['Anxiety'] = { 'diagnosed': 0, 'self diagnosed': 0, 'awaiting diagnosis': 0 }
          
          totals['Anxiety'] += count
          if (lowerCondition.includes('(diagnosed)')) {
            stacked['Anxiety']['diagnosed'] += count
            console.log('    -> Diagnosed')
          }
          else if (lowerCondition.includes('(self diagnosed)')) {
            stacked['Anxiety']['self diagnosed'] += count
            console.log('    -> Self diagnosed')
          }
          else if (lowerCondition.includes('(awaiting diagnosis)')) {
            stacked['Anxiety']['awaiting diagnosis'] += count
            console.log('    -> Awaiting diagnosis')
          }
          else {
            stacked['Anxiety']['diagnosed'] += count
            console.log('    -> Default to diagnosed')
          }
        }
        // All other conditions
        else {
          console.log('  -> Other condition')
          // Remove diagnosis status from condition name for grouping
          const cleanCondition = condition.replace(/ \([^)]*\)$/, '')
          if (!totals[cleanCondition]) totals[cleanCondition] = 0
          totals[cleanCondition] += count
          console.log(`    -> Clean condition: "${cleanCondition}"`)
        }
      })
      
      return { totals, stacked }
    }
    
    const processed = processedMedicalConditions(report.stats.disabilities);
    console.log('\nProcessed data:');
    console.log('Totals:', JSON.stringify(processed.totals, null, 2));
    console.log('Stacked:', JSON.stringify(processed.stacked, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

testMedicalConditions();