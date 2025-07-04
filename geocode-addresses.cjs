const { Pool } = require('pg');
const https = require('https');
const fs = require('fs');
require('dotenv/config');

// Google Places API Key (from client .env)
const GOOGLE_API_KEY = 'AIzaSyAnkQzs5Tzq0omcaZxgT5C4rbICNSRkb_8';

class AddressGeocoder {
  constructor() {
    this.pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    this.delay = 100; // Delay between API calls (Google allows 1000 requests per second)
    this.results = [];
  }

  async fetchMembers() {
    try {
      const result = await this.pool.query(
        'SELECT id, name, address, postcode FROM members ORDER BY id'
      );
      console.log(`Found ${result.rows.length} members to geocode`);
      return result.rows;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  }

  async geocodeAddress(address, postcode) {
    const fullAddress = `${address}, ${postcode}, UK`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_API_KEY}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.status === 'OK' && response.results.length > 0) {
              resolve(response.results[0]);
            } else {
              console.warn(`No results for address: ${fullAddress} (Status: ${response.status})`);
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  extractLocationInfo(geocodeResult) {
    if (!geocodeResult) return null;

    const components = geocodeResult.address_components || [];
    const result = {
      formatted_address: geocodeResult.formatted_address,
      latitude: geocodeResult.geometry.location.lat,
      longitude: geocodeResult.geometry.location.lng,
      postal_town: null,
      administrative_area_level_2: null, // County
      administrative_area_level_1: null, // Region/Country
      country: null,
      locality: null,
      sublocality: null
    };

    // Extract different address components
    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('postal_town')) {
        result.postal_town = component.long_name;
      }
      if (types.includes('locality')) {
        result.locality = component.long_name;
      }
      if (types.includes('sublocality')) {
        result.sublocality = component.long_name;
      }
      if (types.includes('administrative_area_level_2')) {
        result.administrative_area_level_2 = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        result.administrative_area_level_1 = component.long_name;
      }
      if (types.includes('country')) {
        result.country = component.long_name;
      }
    });

    return result;
  }

  categorizeLocation(locationInfo) {
    if (!locationInfo) return 'Unknown';

    // Priority order: postal_town -> locality -> sublocality -> administrative_area_level_2
    const town = locationInfo.postal_town || locationInfo.locality || locationInfo.sublocality;
    const county = locationInfo.administrative_area_level_2;

    // West Midlands specific categorization
    const westMidlandsTowns = [
      'Birmingham', 'Walsall', 'West Bromwich', 'Dudley', 'Wolverhampton',
      'Sutton Coldfield', 'Solihull', 'Coventry', 'Sandwell', 'Streetly'
    ];

    const birminghamDistricts = [
      'Erdington', 'Aston', 'Perry Barr', 'Handsworth', 'Small Heath',
      'Sparkhill', 'Moseley', 'Kings Heath', 'Harborne', 'Edgbaston'
    ];

    if (town) {
      // Check for specific West Midlands towns
      if (westMidlandsTowns.some(wmt => town.toLowerCase().includes(wmt.toLowerCase()))) {
        return `West Midlands - ${town}`;
      }
      
      // Check for Birmingham districts
      if (birminghamDistricts.some(bd => town.toLowerCase().includes(bd.toLowerCase()))) {
        return 'West Midlands - Birmingham';
      }
      
      // Check if it's in West Midlands county
      if (county && county.toLowerCase().includes('west midlands')) {
        return `West Midlands - ${town}`;
      }
      
      // Check for other Midlands areas
      if (county && (county.toLowerCase().includes('midlands') || county.toLowerCase().includes('warwick') || 
                   county.toLowerCase().includes('stafford') || county.toLowerCase().includes('worcest'))) {
        return `Midlands - ${town}`;
      }
      
      // General UK location
      return `${county || 'UK'} - ${town}`;
    }

    return county || 'Unknown';
  }

  async processMembers() {
    const members = await this.fetchMembers();
    
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      console.log(`Processing ${i + 1}/${members.length}: ${member.name}`);
      
      try {
        const geocodeResult = await this.geocodeAddress(member.address, member.postcode);
        const locationInfo = this.extractLocationInfo(geocodeResult);
        const category = this.categorizeLocation(locationInfo);
        
        const result = {
          member_id: member.id,
          name: member.name,
          original_address: member.address,
          postcode: member.postcode,
          geocode_result: geocodeResult,
          location_info: locationInfo,
          geographic_category: category
        };
        
        this.results.push(result);
        
        console.log(`  → ${category}`);
        
        // Add delay to respect API rate limits
        if (i < members.length - 1) {
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }
      } catch (error) {
        console.error(`Error processing ${member.name}:`, error.message);
        this.results.push({
          member_id: member.id,
          name: member.name,
          original_address: member.address,
          postcode: member.postcode,
          error: error.message,
          geographic_category: 'Error'
        });
      }
    }
  }

  async saveResults() {
    const filename = `geocode-results-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(`\nResults saved to: ${filename}`);
    
    // Generate summary
    const summary = {};
    this.results.forEach(result => {
      const category = result.geographic_category;
      summary[category] = (summary[category] || 0) + 1;
    });
    
    console.log('\nGeographic Distribution Summary:');
    Object.entries(summary)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    
    return { filename, summary };
  }

  async close() {
    await this.pool.end();
  }
}

async function main() {
  const geocoder = new AddressGeocoder();
  
  try {
    console.log('Starting address geocoding process...\n');
    await geocoder.processMembers();
    const { filename, summary } = await geocoder.saveResults();
    
    console.log('\n✅ Geocoding completed successfully!');
    console.log(`📄 Results file: ${filename}`);
    console.log(`📊 Categories found: ${Object.keys(summary).length}`);
    
  } catch (error) {
    console.error('❌ Error during geocoding:', error);
  } finally {
    await geocoder.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { AddressGeocoder };