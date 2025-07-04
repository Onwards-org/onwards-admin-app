const { MemberModel } = require('./src/server/models/Member.ts');

async function testBackendChanges() {
  try {
    console.log('Testing Member model report generation...');
    
    // Test the generateMonthlyReport function
    const report = await MemberModel.generateMonthlyReport(6, 2025);
    
    console.log('Medical Conditions from Backend:');
    if (report.summary && report.summary.medicalConditionsBreakdown) {
      Object.entries(report.summary.medicalConditionsBreakdown).forEach(([condition, count]) => {
        console.log(`  ${condition}: ${count}`);
      });
    } else {
      console.log('No medical conditions breakdown found');
      console.log('Available summary data:', Object.keys(report.summary || {}));
    }
    
  } catch (error) {
    console.error('Error testing backend:', error.message);
  }
}

testBackendChanges();