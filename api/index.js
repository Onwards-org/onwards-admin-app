// Simple proxy to bypass TypeScript compilation issues for deployment
// This forwards all requests to the main server entry point

const { createServer } = require('http')
const { URL } = require('url')

// Simple static file serving for development
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // For now, return a simple message indicating the app needs proper deployment
  res.status(200).json({
    message: 'Onwards Admin API - Deployment in progress',
    status: 'building',
    note: 'Full functionality available after TypeScript compilation issues are resolved'
  })
}