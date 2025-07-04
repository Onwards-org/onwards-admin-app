const { Pool } = require('pg');
require('dotenv/config');

async function testGeographyMapping() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Get all member postcodes
    const result = await pool.query('SELECT id, name, postcode FROM members ORDER BY id');
    
    console.log('=== TESTING GEOGRAPHICAL MAPPING ===\n');
    
    // Helper function (copied from Member.ts)
    const getLocationFromPostcode = (postcode) => {
      if (!postcode) return 'Unknown'
      
      const postcodeUpper = postcode.toUpperCase()
      
      // Walsall area - WS postcodes
      if (postcodeUpper.startsWith('WS')) {
        return 'Walsall'
      }
      
      // North Birmingham (Sutton Coldfield) - B7x postcodes
      if (postcodeUpper.startsWith('B7')) {
        return 'North Birmingham (Sutton Coldfield)'
      }
      
      // Central Birmingham - Other B postcodes
      if (postcodeUpper.startsWith('B')) {
        return 'Central Birmingham'
      }
      
      // Black Country - Dudley (DY), Wolverhampton (WV), Sandwell/West Bromwich
      if (postcodeUpper.startsWith('DY') || postcodeUpper.startsWith('WV')) {
        return 'Black Country (Dudley/Wolverhampton/Cradley Heath)'
      }
      
      // Other West Midlands areas
      if (postcodeUpper.startsWith('CV') || postcodeUpper.startsWith('DY') || 
          postcodeUpper.startsWith('WR') || postcodeUpper.startsWith('ST')) {
        return 'Other West Midlands'
      }
      
      return 'Other Areas'
    }
    
    const locationCounts = {};
    
    result.rows.forEach(member => {
      const location = getLocationFromPostcode(member.postcode);
      locationCounts[location] = (locationCounts[location] || 0) + 1;
      console.log(`${member.name.padEnd(25)} | ${member.postcode.padEnd(8)} | ${location}`);
    });
    
    console.log('\n=== GEOGRAPHICAL DISTRIBUTION ===\n');
    Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([location, count]) => {
        const percentage = ((count / result.rows.length) * 100).toFixed(1);
        console.log(`${location.padEnd(50)} | ${count.toString().padStart(2)} members (${percentage.padStart(5)}%)`);
      });
    
    console.log(`\nTotal members: ${result.rows.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testGeographyMapping();