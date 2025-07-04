#!/usr/bin/env node

/**
 * Data Mapping Fix Script for Onwards Registration Data
 * 
 * This script properly maps the registration data values to match
 * the system's predefined options to resolve validation failures.
 */

const fs = require('fs')

// System's valid options (from types.ts)
const EMPLOYMENT_OPTIONS = [
  'Full-time employment', 'Part-time employment', 'Self-employed', 'Unemployed',
  'Student - Full-time', 'Student - Part-time', 'Retired', 
  'Unable to work due to disability', 'Volunteer work', 'Other'
]

const ETHNICITY_OPTIONS = [
  'White - British', 'White - Irish', 'White - Other',
  'Mixed - White and Black Caribbean', 'Mixed - White and Black African', 
  'Mixed - White and Asian', 'Mixed - Other',
  'Asian - Indian', 'Asian - Pakistani', 'Asian - Bangladeshi', 
  'Asian - Chinese', 'Asian - Other',
  'Black - Caribbean', 'Black - African', 'Black - Other',
  'Arab', 'Other ethnic group', 'Prefer not to say'
]

const RELIGION_OPTIONS = [
  'No religion', 'Christian', 'Buddhist', 'Hindu', 'Jewish', 
  'Muslim', 'Sikh', 'Any other religion', 'Prefer not to say'
]

const SEXUAL_ORIENTATION_OPTIONS = [
  'Heterosexual/Straight', 'Gay or Lesbian', 'Bisexual', 'Pansexual', 
  'Asexual', 'Other', 'Prefer not to say'
]

const MEDICAL_CONDITIONS_OPTIONS = [
  'Autism (diagnosed)', 'Autism (self diagnosed)', 'Autism (awaiting diagnosis)',
  'ADHD (diagnosed)', 'ADHD (self diagnosed)', 'ADHD (awaiting diagnosis)',
  'Anxiety (diagnosed)', 'Anxiety (self diagnosed)', 'Anxiety (awaiting diagnosis)',
  'Chronic Illness', 'OCD', 'Learning Disabilities', 'Selective Mutism',
  'PTSD', 'Depression', 'BPD', 'Bipolar Disorder', 'Schizophrenia',
  'Hearing/Visual Impairment', 'Other'
]

// Data mapping functions
function mapEmploymentStatus(value) {
  if (!value || value.trim() === '') return 'Other'
  
  const mapping = {
    'Employed': 'Full-time employment',
    'Home educated': 'Other',
    'In full / part time education': 'Student - Full-time',
    'Self-employed': 'Self-employed',
    'Unemployed': 'Unemployed',
    'Prefer not to say': 'Other'
  }
  
  return mapping[value.trim()] || 'Other'
}

function mapEthnicity(value) {
  if (!value || value.trim() === '') return 'Prefer not to say'
  
  const mapping = {
    'White: White British': 'White - British',
    'Asian: Asian Pakistani': 'Asian - Pakistani',
    'Prefer not to say': 'Prefer not to say'
  }
  
  return mapping[value.trim()] || 'Prefer not to say'
}

function mapReligion(value) {
  if (!value || value.trim() === '') return 'Prefer not to say'
  
  const mapping = {
    'None': 'No religion',
    'Muslim': 'Muslim',
    'Christian': 'Christian',
    'Other': 'Any other religion',
    'Prefer not to say': 'Prefer not to say'
  }
  
  return mapping[value.trim()] || 'Prefer not to say'
}

function mapSexualOrientation(value) {
  if (!value || value.trim() === '') return 'Prefer not to say'
  
  const mapping = {
    'Heterosexual': 'Heterosexual/Straight',
    'Bisexual': 'Bisexual',
    'Prefer not to say': 'Prefer not to say'
  }
  
  return mapping[value.trim()] || 'Prefer not to say'
}

function mapMedicalConditions(value) {
  if (!value || value.trim() === '') return []
  
  const conditionMapping = {
    'Autism (Diagnosed)': 'Autism (diagnosed)',
    'ADHD (Diagnosed)': 'ADHD (diagnosed)', 
    'ADHD (Awaiting diagnosis)': 'ADHD (awaiting diagnosis)',
    'Anxiety (Diagnosed)': 'Anxiety (diagnosed)',
    'Depression': 'Depression',
    'Mental health issues': 'Other',
    'Visual impairment': 'Hearing/Visual Impairment',
    'Learning disability': 'Learning Disabilities',
    'Progressive illness': 'Chronic Illness',
    'Chronic illness': 'Chronic Illness',
    'Other': 'Other'
  }
  
  // Split by comma and map each condition
  const conditions = value.split(',').map(c => c.trim()).filter(c => c)
  const mapped = []
  
  for (const condition of conditions) {
    const mappedCondition = conditionMapping[condition] || 'Other'
    if (!mapped.includes(mappedCondition)) {
      mapped.push(mappedCondition)
    }
  }
  
  return mapped
}

function generatePlaceholderEmail(name) {
  if (!name) return 'unknown@example.com'
  
  const cleanName = name.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(' ')
    .filter(part => part.length > 0)
    .join('.')
  
  return `${cleanName}@example.com`
}

function cleanPhoneNumber(phone) {
  if (!phone) return ''
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Handle various formats
  if (cleaned.startsWith('+447')) {
    return '0' + cleaned.slice(4)
  } else if (cleaned.startsWith('447')) {
    return '0' + cleaned.slice(3)
  } else if (cleaned.startsWith('07')) {
    return cleaned
  } else if (cleaned.length === 10 && !cleaned.startsWith('0')) {
    return '0' + cleaned
  }
  
  return cleaned
}

function processCleanedData() {
  console.log('🔄 Processing cleaned member data with proper field mapping...')
  
  try {
    // Read the TSV data
    const tsvContent = fs.readFileSync('cleaned-members.txt', 'utf8')
    const lines = tsvContent.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error('No data found in file')
    }
    
    const headers = lines[0].split('\t')
    const members = []
    
    console.log(`Found ${lines.length - 1} member records to process`)
    
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split('\t')
      
      // Build member object with proper mapping
      const member = {
        name: row[0] || '',
        email: row[1] || generatePlaceholderEmail(row[0]),
        phone: cleanPhoneNumber(row[2]) || '',
        address: row[3] || '',
        postcode: row[4] || '',
        birth_month: parseInt(row[5]) || 1,
        birth_year: parseInt(row[6]) || 1990,
        ethnicity: mapEthnicity(row[7]),
        hobbies_interests: row[8] || '',
        employment_status: mapEmploymentStatus(row[16]),
        religion: mapReligion(row[13]),
        sexual_orientation: mapSexualOrientation(row[14]),
        gender: row[15] || 'Prefer not to say',
        transgender_status: 'Prefer not to say',
        pregnancy_maternity: 'Not applicable',
        additional_health_info: '',
        privacy_accepted: true,
        emergency_contacts: [
          {
            name: row[9] || 'Emergency Contact',
            phone: cleanPhoneNumber(row[10]) || ''
          }
        ],
        medical_conditions: mapMedicalConditions(row[11]),
        challenging_behaviours: []
      }
      
      // Validate required fields are not empty
      if (!member.name || !member.email || !member.phone || !member.address) {
        console.log(`⚠️  Skipping incomplete record for ${member.name || 'Unknown'}`)
        continue
      }
      
      members.push(member)
    }
    
    console.log(`✅ Successfully processed ${members.length} member records`)
    
    // Write the properly mapped data
    fs.writeFileSync('registration-data-cleaned.json', JSON.stringify(members, null, 2))
    console.log('📝 Saved cleaned data to registration-data-cleaned.json')
    
    // Display sample of the cleaned data
    console.log('\n📋 Sample of cleaned data (first record):')
    if (members.length > 0) {
      console.log(JSON.stringify(members[0], null, 2))
    }
    
    return members
    
  } catch (error) {
    console.error('❌ Error processing data:', error.message)
    throw error
  }
}

// Run the processing
if (require.main === module) {
  processCleanedData()
}

module.exports = { processCleanedData }