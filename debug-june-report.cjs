#!/usr/bin/env node

/**
 * Debug script to check June report data
 */

const http = require('http')

async function makeApiRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
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
    
    req.end()
  })
}

async function debugJuneReport() {
  try {
    console.log('🔍 Debugging June 2024 report data...\n')
    
    // Test the member report endpoint for June 2024
    console.log('📊 Testing member report for June 2024...')
    const memberReport = await makeApiRequest('http://localhost:8080/api/members/report/2024/6/pdf')
    console.log(`Status: ${memberReport.status}`)
    if (memberReport.status !== 200) {
      console.log('Response:', memberReport.data)
    } else {
      console.log('✅ Member report endpoint accessible')
    }
    
    // Test the attendance report endpoint for June 2024
    console.log('\n📈 Testing attendance report for June 2024...')
    const attendanceReport = await makeApiRequest('http://localhost:8080/api/attendance/report/2024/6')
    console.log(`Status: ${attendanceReport.status}`)
    if (attendanceReport.status === 200) {
      console.log('✅ Attendance report data:')
      console.log('Total stats keys:', Object.keys(attendanceReport.data.stats || {}))
      if (attendanceReport.data.stats) {
        console.log('Genders:', attendanceReport.data.stats.genders)
        console.log('Age groups:', attendanceReport.data.stats.age_groups)
        console.log('Employment:', attendanceReport.data.stats.employment_status)
      }
    } else {
      console.log('❌ Error:', memberReport.data)
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

debugJuneReport()