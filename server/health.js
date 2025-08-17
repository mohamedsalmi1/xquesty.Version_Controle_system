/**
 * Standalone health check script that can be used to test the API environment
 * This doesn't require the full Express framework to run
 */

const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);

  if (req.url === '/api/health' || req.url === '/health') {
    // Get environment info
    const env = {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      hostname: os.hostname(),
      platform: os.platform(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      cwd: process.cwd(),
      files: fs.existsSync('./') ? fs.readdirSync('./') : []
    };

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Health check passed',
      timestamp: new Date().toISOString(),
      environment: env
    }, null, 2));
    return;
  }

  // Default response for other routes
  res.statusCode = 404;
  res.end('Not found');
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Current directory: ${process.cwd()}`);
  try {
    console.log(`Directory listing: ${fs.readdirSync('./').join(', ')}`);
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
  }
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully.');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
