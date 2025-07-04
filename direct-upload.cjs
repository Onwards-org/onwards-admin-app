#!/usr/bin/env node

/**
 * Direct API Upload Script for Cleaned Registration Data
 * Uses HTTP requests to upload member data via the API
 */

const fs = require('fs')
const http = require('http')

async function makeApiRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }
    
    const req = http.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            data: responseData ? JSON.parse(responseData) : null
          }
          resolve(result)
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            error: 'Invalid JSON response'
          })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.write(data)
    req.end()
  })
}

async function uploadMembers() {
  try {
    console.log('🚀 Starting member upload process...')
    
    // Read the cleaned data
    const data = fs.readFileSync('registration-data-cleaned.json', 'utf8')
    const members = JSON.parse(data)
    
    console.log(`📊 Found ${members.length} members to upload`)
    
    let successful = 0
    let failed = 0
    const errors = []
    
    for (let i = 0; i < members.length; i++) {
      const member = members[i]
      console.log(`\n🔄 Uploading ${i + 1}/${members.length}: ${member.name}`)
      
      try {
        const response = await makeApiRequest(
          'http://localhost:8080/api/members/register',
          'POST',
          JSON.stringify(member)
        )
        
        if (response.status === 201 || response.status === 200) {
          console.log(`✅ Success: ${member.name} uploaded`)
          successful++
        } else {
          console.log(`❌ Failed: ${member.name} - Status ${response.status}`)
          console.log(`   Response: ${JSON.stringify(response.data)}`)
          failed++
          errors.push(`${member.name}: ${response.data?.error || 'Unknown error'}`)
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        console.log(`❌ Error uploading ${member.name}: ${error.message}`)
        failed++
        errors.push(`${member.name}: ${error.message}`)
      }
    }
    
    console.log('\n📈 UPLOAD SUMMARY:')
    console.log(`✅ Successful: ${successful}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📊 Total: ${members.length}`)
    
    if (errors.length > 0) {
      console.log('\n🚨 ERRORS:')
      errors.forEach(error => console.log(`   ${error}`))
    }
    
    // Save report
    const report = {
      total: members.length,
      successful,
      failed,
      errors,
      timestamp: new Date().toISOString()
    }
    
    fs.writeFileSync('upload-report-direct.json', JSON.stringify(report, null, 2))
    console.log('\n📝 Report saved to upload-report-direct.json')
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Check server health first
async function checkHealth() {
  try {
    console.log('🔍 Checking server health...')
    const response = await makeApiRequest('http://localhost:8080/api/health', 'GET', '')
    
    if (response.status === 200) {
      console.log('✅ Server is healthy')
      return true
    } else {
      console.log(`❌ Server health check failed: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Cannot reach server: ${error.message}`)
    console.log('   Make sure development server is running: npm run dev:detached')
    return false
  }
}

async function main() {
  console.log('🎯 Direct Member Upload to Onwards Admin System')
  
  const healthy = await checkHealth()
  if (!healthy) {
    process.exit(1)
  }
  
  await uploadMembers()
  console.log('🏁 Upload process completed!')
}

if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error)
    process.exit(1)
  })
}