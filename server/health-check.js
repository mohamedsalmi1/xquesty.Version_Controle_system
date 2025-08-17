/**
 * Simple health check module for StageQuest API server
 * This allows Docker's health check to verify the server is running properly
 */

// Simple health check endpoints for Docker and monitoring

/**
 * Adds health check endpoints to the Express app
 * @param {import('express').Application} app - The Express application
 */
export function addHealthCheck(app) {
  // Health check endpoints
  app.head('/api/health', (req, res) => {
    res.status(200).end();
  });

  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      message: 'API server is running',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Add verification endpoints for testing student and recruiter authentication
  app.get('/api/verify-student', (req, res) => {
    // For testing purposes, send a mock successful response
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // In production, you would verify the token here
    // For now, just return mock data
    res.status(200).json({
      name: "Test Student",
      university: "Example University",
      major: "Computer Science",
      id: "student-123",
      isAuthenticated: true
    });
  });

  app.get('/api/verify-recruiter', (req, res) => {
    // For testing purposes, send a mock successful response
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // In production, you would verify the token here
    // For now, just return mock data
    res.status(200).json({
      name: "Test Recruiter",
      company: "Example Company",
      id: "recruiter-456",
      isAuthenticated: true
    });
  });

  console.log("Health check and verification endpoints registered");
}
