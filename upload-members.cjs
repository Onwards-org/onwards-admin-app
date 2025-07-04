#!/usr/bin/env node

/**
 * Member Registration Data Upload Script for Onwards Admin System
 * 
 * This script parses tab-separated registration data and uploads it to the admin system.
 * Run with: node upload-members.js [data-file.txt]
 * 
 * Data format: Tab-separated values with headers in first row
 * API endpoint: POST http://localhost:8080/api/members/register
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const { URL } = require('url')

// Configuration
const API_BASE_URL = 'http://localhost:8080/api'
const DEFAULT_DATA_FILE = 'member-data.txt'

// Valid options from the system
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

const GENDER_OPTIONS = [
  'Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'
]

const SEXUAL_ORIENTATION_OPTIONS = [
  'Heterosexual/Straight', 'Gay or Lesbian', 'Bisexual', 'Pansexual', 
  'Asexual', 'Other', 'Prefer not to say'
]

const TRANSGENDER_OPTIONS = [
  'No', 'Yes', 'Prefer not to say'
]

const PREGNANCY_OPTIONS = [
  'Not applicable', 'Pregnant', 'On maternity leave', 
  'Recently given birth (within 26 weeks)', 'Prefer not to say'
]

const MEDICAL_CONDITIONS_OPTIONS = [
  'Autism (diagnosed)', 'Autism (self diagnosed)', 'Autism (awaiting diagnosis)',
  'ADHD (diagnosed)', 'ADHD (self diagnosed)', 'ADHD (awaiting diagnosis)',
  'Anxiety (diagnosed)', 'Anxiety (self diagnosed)', 'Anxiety (awaiting diagnosis)',
  'Chronic Illness', 'OCD', 'Learning Disabilities', 'Selective Mutism',
  'PTSD', 'Depression', 'BPD', 'Bipolar Disorder', 'Schizophrenia',
  'Hearing/Visual Impairment', 'Other'
]

const CHALLENGING_BEHAVIOURS_OPTIONS = [
  'Self-harm', 'Aggression towards others', 'Property destruction', 
  'Verbal outbursts', 'Social withdrawal', 'Repetitive behaviours',
  'Sensory seeking behaviours', 'Food-related issues', 'Sleep difficulties', 'Other'
]

// Logging utilities
function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
  console.log(`${prefix} [${timestamp}] ${message}`)
}

function logError(message, error = null) {
  log(message, 'error')
  if (error) {
    console.error('   Details:', error.message || error)
  }
}

function logSuccess(message) {
  log(message, 'success')
}

// Validation helpers
function validatePhoneNumber(phone) {
  if (!phone) return null
  
  // Clean the phone number
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // UK phone number validation regex
  const ukPhoneRegex = /^(\+44|0)[1-9]\d{8,9}$/
  
  if (ukPhoneRegex.test(cleaned)) {
    return cleaned
  }
  
  // Try to fix common formats
  if (cleaned.startsWith('44') && !cleaned.startsWith('+44')) {
    const fixed = '+' + cleaned
    if (ukPhoneRegex.test(fixed)) return fixed
  }
  
  if (cleaned.length === 10 && !cleaned.startsWith('0')) {
    const fixed = '0' + cleaned
    if (ukPhoneRegex.test(fixed)) return fixed
  }
  
  return null
}

function validateEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

function findClosestMatch(value, validOptions) {
  if (!value) return null
  
  const lowerValue = value.toLowerCase().trim()
  
  // Exact match first
  const exactMatch = validOptions.find(option => 
    option.toLowerCase() === lowerValue
  )
  if (exactMatch) return exactMatch
  
  // Partial match
  const partialMatch = validOptions.find(option => 
    option.toLowerCase().includes(lowerValue) || 
    lowerValue.includes(option.toLowerCase())
  )
  if (partialMatch) return partialMatch
  
  // Common mappings for employment
  if (validOptions === EMPLOYMENT_OPTIONS) {
    const employmentMappings = {
      'full-time': 'Full-time employment',
      'fulltime': 'Full-time employment',
      'part-time': 'Part-time employment',
      'parttime': 'Part-time employment',
      'student': 'Student - Full-time',
      'self employed': 'Self-employed',
      'unemployed': 'Unemployed',
      'retired': 'Retired',
      'disabled': 'Unable to work due to disability',
      'volunteer': 'Volunteer work'
    }
    
    for (const [key, mapped] of Object.entries(employmentMappings)) {
      if (lowerValue.includes(key)) return mapped
    }
  }
  
  // Common mappings for gender
  if (validOptions === GENDER_OPTIONS) {
    const genderMappings = {
      'm': 'Male',
      'male': 'Male',
      'f': 'Female',
      'female': 'Female',
      'non-binary': 'Non-binary',
      'nonbinary': 'Non-binary',
      'nb': 'Non-binary'
    }
    
    if (genderMappings[lowerValue]) return genderMappings[lowerValue]
  }
  
  return null
}

function parseConditions(conditionsStr, validOptions) {
  if (!conditionsStr) return []
  
  // Split by common delimiters
  const conditions = conditionsStr.split(/[,;|]/).map(c => c.trim()).filter(c => c)
  const mapped = []
  
  for (const condition of conditions) {
    const match = findClosestMatch(condition, validOptions)
    if (match && !mapped.includes(match)) {
      mapped.push(match)
    } else {
      log(`Warning: Could not map condition "${condition}" to valid option`, 'error')
    }
  }
  
  return mapped
}

// Field mapping function
function mapRowToMember(row, headers) {
  const getValue = (fieldName) => {
    const index = headers.findIndex(h => 
      h.toLowerCase().includes(fieldName.toLowerCase())
    )
    return index >= 0 ? (row[index] || '').trim() : ''
  }
  
  const getValueExact = (fieldName) => {
    const index = headers.findIndex(h => 
      h.toLowerCase() === fieldName.toLowerCase()
    )
    return index >= 0 ? (row[index] || '').trim() : ''
  }
  
  // Extract birth information
  const birthMonth = parseInt(getValue('birth_month') || getValue('month')) || null
  const birthYear = parseInt(getValue('birth_year') || getValue('year')) || null
  
  // Handle date of birth if provided as single field
  const dobField = getValue('date_of_birth') || getValue('dob')
  let finalBirthMonth = birthMonth
  let finalBirthYear = birthYear
  
  if (dobField && (!birthMonth || !birthYear)) {
    // Try to parse various date formats
    const dateFormats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
    ]
    
    for (const format of dateFormats) {
      const match = dobField.match(format)
      if (match) {
        if (format.source.startsWith('\\(\\d{4}')) {
          // YYYY-MM-DD format
          finalBirthYear = parseInt(match[1])
          finalBirthMonth = parseInt(match[2])
        } else {
          // Assume DD/MM/YYYY or DD-MM-YYYY format (UK standard)
          finalBirthMonth = parseInt(match[2])
          finalBirthYear = parseInt(match[3])
        }
        break
      }
    }
  }
  
  // Parse emergency contacts
  const emergencyContacts = []
  
  // Try to find emergency contact fields
  const contact1Name = getValue('emergency_contact_1_name') || getValue('emergency_name_1') || getValue('emergency_contact_name')
  const contact1Phone = getValue('emergency_contact_1_phone') || getValue('emergency_phone_1') || getValue('emergency_contact_phone')
  
  const contact2Name = getValue('emergency_contact_2_name') || getValue('emergency_name_2')
  const contact2Phone = getValue('emergency_contact_2_phone') || getValue('emergency_phone_2')
  
  if (contact1Name && contact1Phone) {
    const validPhone = validatePhoneNumber(contact1Phone)
    if (validPhone) {
      emergencyContacts.push({ name: contact1Name, phone: validPhone })
    }
  }
  
  if (contact2Name && contact2Phone) {
    const validPhone = validatePhoneNumber(contact2Phone)
    if (validPhone) {
      emergencyContacts.push({ name: contact2Name, phone: validPhone })
    }
  }
  
  // If no structured emergency contacts found, look for general contact info
  if (emergencyContacts.length === 0) {
    const generalContact = getValue('emergency_contact') || getValue('next_of_kin')
    const generalPhone = getValue('emergency_phone') || getValue('contact_phone')
    
    if (generalContact && generalPhone) {
      const validPhone = validatePhoneNumber(generalPhone)
      if (validPhone) {
        emergencyContacts.push({ name: generalContact, phone: validPhone })
      }
    }
  }
  
  // Build member object
  const member = {
    name: getValue('name') || getValue('full_name') || getValue('first_name') + ' ' + getValue('last_name'),
    phone: validatePhoneNumber(getValue('phone') || getValue('telephone') || getValue('mobile')),
    email: (getValue('email') || getValue('email_address')).toLowerCase(),
    address: getValue('address') || getValue('full_address') || (
      [getValue('address_line_1'), getValue('address_line_2'), getValue('city'), getValue('town')]
        .filter(a => a).join(', ')
    ),
    postcode: getValue('postcode') || getValue('postal_code') || getValue('zip'),
    birth_month: finalBirthMonth,
    birth_year: finalBirthYear,
    employment_status: findClosestMatch(getValue('employment') || getValue('employment_status'), EMPLOYMENT_OPTIONS),
    ethnicity: findClosestMatch(getValue('ethnicity') || getValue('ethnic_background'), ETHNICITY_OPTIONS),
    religion: findClosestMatch(getValue('religion') || getValue('religious_belief'), RELIGION_OPTIONS),
    gender: findClosestMatch(getValue('gender'), GENDER_OPTIONS),
    sexual_orientation: findClosestMatch(getValue('sexual_orientation') || getValue('sexuality'), SEXUAL_ORIENTATION_OPTIONS),
    transgender_status: findClosestMatch(getValue('transgender') || getValue('trans'), TRANSGENDER_OPTIONS) || 'Prefer not to say',
    hobbies_interests: getValue('hobbies') || getValue('interests') || getValue('hobbies_interests'),
    pregnancy_maternity: findClosestMatch(getValue('pregnancy') || getValue('maternity'), PREGNANCY_OPTIONS) || 'Not applicable',
    additional_health_info: getValue('health_info') || getValue('additional_health') || getValue('medical_notes'),
    privacy_accepted: true, // Required for registration
    emergency_contacts: emergencyContacts,
    medical_conditions: parseConditions(getValue('medical_conditions') || getValue('conditions'), MEDICAL_CONDITIONS_OPTIONS),
    challenging_behaviours: parseConditions(getValue('challenging_behaviours') || getValue('behaviours'), CHALLENGING_BEHAVIOURS_OPTIONS)
  }
  
  return member
}

// Validation function
function validateMember(member, rowIndex) {
  const errors = []
  
  if (!member.name || member.name.length < 2) {
    errors.push(`Row ${rowIndex}: Name is required and must be at least 2 characters`)
  }
  
  if (!member.phone) {
    errors.push(`Row ${rowIndex}: Valid UK phone number is required`)
  }
  
  if (!validateEmail(member.email)) {
    errors.push(`Row ${rowIndex}: Valid email address is required`)
  }
  
  if (!member.address || member.address.length < 10) {
    errors.push(`Row ${rowIndex}: Complete address is required`)
  }
  
  if (!member.birth_month || member.birth_month < 1 || member.birth_month > 12) {
    errors.push(`Row ${rowIndex}: Valid birth month (1-12) is required`)
  }
  
  if (!member.birth_year || member.birth_year < 1900 || member.birth_year > new Date().getFullYear()) {
    errors.push(`Row ${rowIndex}: Valid birth year is required`)
  }
  
  if (!member.employment_status) {
    errors.push(`Row ${rowIndex}: Employment status is required`)
  }
  
  if (!member.ethnicity) {
    errors.push(`Row ${rowIndex}: Ethnicity is required`)
  }
  
  if (!member.religion) {
    errors.push(`Row ${rowIndex}: Religion is required`)
  }
  
  if (!member.gender) {
    errors.push(`Row ${rowIndex}: Gender is required`)
  }
  
  if (!member.sexual_orientation) {
    errors.push(`Row ${rowIndex}: Sexual orientation is required`)
  }
  
  if (member.emergency_contacts.length === 0) {
    errors.push(`Row ${rowIndex}: At least one emergency contact is required`)
  }
  
  return errors
}

// HTTP client function (using built-in modules)
function makeHttpRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const client = urlObj.protocol === 'https:' ? https : http
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }
    
    const req = client.request(requestOptions, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            statusText: res.statusMessage,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            json: () => Promise.resolve(JSON.parse(data)),
            text: () => Promise.resolve(data)
          }
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
    
    if (options.timeout) {
      req.setTimeout(options.timeout)
    }
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

// API call function
async function uploadMember(member) {
  try {
    const response = await makeHttpRequest(`${API_BASE_URL}/members/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(member),
      timeout: 10000
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`)
    }
    
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Main parsing and upload function
async function processDataFile(filePath) {
  try {
    log(`Reading data file: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const lines = fileContent.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row')
    }
    
    log(`Found ${lines.length} lines (including header)`)
    
    // Parse headers
    const headers = lines[0].split('\t').map(h => h.trim())
    log(`Headers: ${headers.join(', ')}`)
    
    const results = {
      total: lines.length - 1,
      successful: 0,
      failed: 0,
      errors: []
    }
    
    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split('\t')
      const rowIndex = i + 1
      
      try {
        log(`Processing row ${rowIndex}/${lines.length}...`)
        
        // Map the row to member format
        const member = mapRowToMember(row, headers)
        
        // Validate the member data
        const validationErrors = validateMember(member, rowIndex)
        if (validationErrors.length > 0) {
          logError(`Validation failed for row ${rowIndex}:`)
          validationErrors.forEach(error => logError(`  ${error}`))
          results.failed++
          results.errors.push(...validationErrors)
          continue
        }
        
        // Upload the member
        const uploadResult = await uploadMember(member)
        
        if (uploadResult.success) {
          logSuccess(`✅ Row ${rowIndex}: ${member.name} (${member.email}) uploaded successfully`)
          results.successful++
        } else {
          logError(`❌ Row ${rowIndex}: Upload failed for ${member.name} (${member.email})`, uploadResult.error)
          results.failed++
          results.errors.push(`Row ${rowIndex}: ${uploadResult.error}`)
        }
        
        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        logError(`❌ Row ${rowIndex}: Processing failed`, error)
        results.failed++
        results.errors.push(`Row ${rowIndex}: ${error.message}`)
      }
    }
    
    // Summary
    log('\n📊 UPLOAD SUMMARY')
    log(`Total records processed: ${results.total}`)
    logSuccess(`Successful uploads: ${results.successful}`)
    logError(`Failed uploads: ${results.failed}`)
    
    if (results.errors.length > 0) {
      log('\n❌ ERRORS ENCOUNTERED:')
      results.errors.forEach(error => logError(`  ${error}`))
    }
    
    // Write results to file
    const reportPath = `upload-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
    log(`📝 Detailed report saved to: ${reportPath}`)
    
    return results
    
  } catch (error) {
    logError('Fatal error processing file', error)
    throw error
  }
}

// Check server health
async function checkServerHealth() {
  try {
    log('Checking server health...')
    const response = await makeHttpRequest(`${API_BASE_URL}/health`, { 
      method: 'GET',
      timeout: 5000 
    })
    if (response.ok) {
      logSuccess('Server is running and accessible')
      return true
    } else {
      logError(`Server health check failed: HTTP ${response.status}`)
      return false
    }
  } catch (error) {
    logError('Server health check failed', error)
    logError('Make sure the development server is running: npm run dev:detached')
    return false
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const dataFile = args[0] || DEFAULT_DATA_FILE
  
  log('🚀 Onwards Member Registration Upload Script')
  log(`Data file: ${dataFile}`)
  log(`API endpoint: ${API_BASE_URL}/members/register`)
  
  // Check if server is running
  const serverHealthy = await checkServerHealth()
  if (!serverHealthy) {
    process.exit(1)
  }
  
  try {
    await processDataFile(dataFile)
    logSuccess('🎉 Upload process completed!')
  } catch (error) {
    logError('💥 Upload process failed', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    logError('Unexpected error', error)
    process.exit(1)
  })
}

module.exports = {
  processDataFile,
  mapRowToMember,
  validateMember,
  uploadMember
}