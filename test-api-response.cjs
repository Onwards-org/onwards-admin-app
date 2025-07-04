const fetch = require('node-fetch');

async function testApiResponse() {
  try {
    console.log('🧪 Testing API response for June 20, 2025...');
    
    // You'll need to replace this with a valid JWT token from your browser's localStorage
    const authToken = 'YOUR_JWT_TOKEN_HERE'; // Get this from browser dev tools
    
    const response = await fetch('http://localhost:3001/api/attendance/members-for-date/2025-06-20', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`Error details: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response received:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.session) {
      console.log('\n📋 Session details:');
      console.log(`  - Status: ${data.session.status}`);
      console.log(`  - Reason: ${data.session.cancellation_reason || 'N/A'}`);
      console.log(`  - Cancelled by: ${data.session.cancelled_by || 'N/A'}`);
    } else {
      console.log('\n❌ No session data in response');
    }
    
    console.log(`\n👥 Members returned: ${data.members ? data.members.length : 'N/A'}`);
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\n💡 Note: You need to get a valid JWT token from the browser to test this API.');
    console.log('   1. Go to the Onwards admin interface');
    console.log('   2. Open browser dev tools → Application → Local Storage');
    console.log('   3. Find the auth token and replace YOUR_JWT_TOKEN_HERE in this script');
  }
}

testApiResponse();