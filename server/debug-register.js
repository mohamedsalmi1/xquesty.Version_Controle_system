// Direct script to test the registration endpoint using different methods
const http = require('http');
const https = require('https');

// Configuration
const apiUrl = 'http://localhost:3000/api/register';
const testUser = {
  name: 'Debug User',
  company: 'Debug Company',
  email: 'debug@example.com',
  password: 'Debug123!'
};

// Function to test registration using Node's built-in http module
function testWithHttp() {
  console.log('\n=== Testing with Node.js HTTP module ===');
  
  return new Promise((resolve, reject) => {
    // Parse the URL
    const url = new URL(apiUrl);
    
    // Prepare the request data
    const data = JSON.stringify(testUser);
    
    // Request options
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    console.log('Request options:', options);
    console.log('Request payload:', data);
    
    // Send request
    const req = http.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log('Headers:', res.headers);
      
      let responseData = '';
      
      // A chunk of data has been received
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      // The whole response has been received
      res.on('end', () => {
        console.log('Raw response:', responseData);
        
        try {
          const parsedData = JSON.parse(responseData);
          console.log('Parsed response:', parsedData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          console.error('Error parsing response:', e.message);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    // Handle request errors
    req.on('error', (error) => {
      console.error('Request error:', error.message);
      reject(error);
    });
    
    // Send the data
    req.write(data);
    req.end();
  });
}

// Main function
async function main() {
  console.log('Starting debug tests for registration endpoint');
  console.log('Test user data:', testUser);
  
  try {
    // Test with Node HTTP
    await testWithHttp();
    
    console.log('\nTests completed.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
main();
