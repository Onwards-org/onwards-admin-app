const fs = require('fs');

function analyzeGeographicalData() {
  // Read the geocoding results
  const data = JSON.parse(fs.readFileSync('geocode-results-2025-07-01.json', 'utf8'));
  
  console.log('=== GEOGRAPHICAL ANALYSIS ===\n');
  
  // Current detailed breakdown
  const detailed = {};
  data.forEach(member => {
    const category = member.geographic_category;
    detailed[category] = (detailed[category] || 0) + 1;
  });
  
  console.log('Current detailed breakdown:');
  Object.entries(detailed)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
  
  // Create broader regional categories
  const broaderCategories = {
    'Central Birmingham': 0,
    'North Birmingham (Sutton Coldfield)': 0,
    'Walsall': 0,
    'Black Country (Dudley/Wolverhampton/Cradley Heath)': 0,
    'Other West Midlands': 0
  };
  
  const categoryMapping = {};
  
  data.forEach(member => {
    const category = member.geographic_category;
    let broader;
    
    if (category.includes('Birmingham')) {
      broader = 'Central Birmingham';
    } else if (category.includes('Sutton Coldfield')) {
      broader = 'North Birmingham (Sutton Coldfield)';
    } else if (category.includes('Walsall')) {
      broader = 'Walsall';
    } else if (category.includes('Dudley') || category.includes('Wolverhampton') || category.includes('Cradley Heath')) {
      broader = 'Black Country (Dudley/Wolverhampton/Cradley Heath)';
    } else {
      broader = 'Other West Midlands';
    }
    
    broaderCategories[broader]++;
    categoryMapping[category] = broader;
  });
  
  console.log('\n=== PROPOSED BROADER CATEGORIES ===\n');
  Object.entries(broaderCategories)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      const percentage = ((count / data.length) * 100).toFixed(1);
      console.log(`  ${category}: ${count} members (${percentage}%)`);
    });
  
  console.log('\n=== CATEGORY MAPPING ===\n');
  Object.entries(categoryMapping).forEach(([detailed, broader]) => {
    console.log(`  "${detailed}" → "${broader}"`);
  });
  
  // Generate member list with broader categories
  const membersWithBroadCategories = data.map(member => ({
    ...member,
    broader_geographic_category: categoryMapping[member.geographic_category]
  }));
  
  // Save the enhanced data
  fs.writeFileSync('members-with-geography.json', JSON.stringify(membersWithBroadCategories, null, 2));
  console.log('\n✅ Enhanced data saved to: members-with-geography.json');
  
  return {
    detailed: detailed,
    broader: broaderCategories,
    mapping: categoryMapping
  };
}

if (require.main === module) {
  analyzeGeographicalData();
}

module.exports = { analyzeGeographicalData };