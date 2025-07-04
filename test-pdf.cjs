const http = require('http');

// First get auth token
const loginData = JSON.stringify({
  username: 'admin',
  password: 'password123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

console.log('Attempting to login...');

const loginReq = http.request(loginOptions, (loginRes) => {
  let loginBody = '';
  
  loginRes.on('data', (chunk) => {
    loginBody += chunk;
  });
  
  loginRes.on('end', () => {
    console.log('Login response:', loginBody);
    
    try {
      const loginResult = JSON.parse(loginBody);
      
      if (loginResult.token) {
        console.log('Got token, requesting PDF...');
        
        // Now request PDF
        const pdfOptions = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/attendance/report/2025/6/pdf',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginResult.token}`
          }
        };
        
        const pdfReq = http.request(pdfOptions, (pdfRes) => {
          console.log('PDF response status:', pdfRes.statusCode);
          console.log('PDF response headers:', pdfRes.headers);
          
          let pdfData = [];
          
          pdfRes.on('data', (chunk) => {
            pdfData.push(chunk);
          });
          
          pdfRes.on('end', () => {
            if (pdfRes.statusCode === 200) {
              console.log('PDF generated successfully! Size:', Buffer.concat(pdfData).length, 'bytes');
            } else {
              console.log('PDF generation failed:', Buffer.concat(pdfData).toString());
            }
          });
        });
        
        pdfReq.on('error', (err) => {
          console.error('PDF request error:', err);
        });
        
        pdfReq.end();
      } else {
        console.log('Login failed:', loginResult);
      }
    } catch (err) {
      console.error('Error parsing login response:', err);
    }
  });
});

loginReq.on('error', (err) => {
  console.error('Login request error:', err);
});

loginReq.write(loginData);
loginReq.end();