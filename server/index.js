const express = require('express');
const cors = require('cors');
const app = express();

// Load our Supabase service
let supabaseService;

try {
  supabaseService = require('./supabaseRecruiterService');
  console.log('Supabase Recruiter Service loaded successfully');
} catch (serviceError) {
  console.error('Failed to load Supabase Service:', serviceError.message);
  console.log('Registration will use fallback mode');
}

// Enable CORS with more permissive configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

// Parse JSON requests with more detailed error handling
app.use(express.json({
  limit: '1mb',
  strict: false, // Be more lenient with JSON parsing
}));

// Also support form URL encoded data
app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/health', '/api/verify-student', '/api/verify-recruiter', '/api/register', '/api/login']
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Verify student endpoint
app.get('/api/verify-student', (req, res) => {
  res.json({
    message: 'Student endpoint accessible',
    timestamp: new Date().toISOString(),
    role: 'student'
  });
});

// Verify recruiter endpoint
app.get('/api/verify-recruiter', (req, res) => {
  res.json({
    message: 'Recruiter endpoint accessible',
    timestamp: new Date().toISOString(),
    role: 'recruiter'
  });
});

// Register endpoint - FIXED VERSION
app.post('/api/register', async (req, res) => {
  console.log('--------------- REGISTRATION REQUEST ---------------');
  console.log('Registration request received at', new Date().toISOString());
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body content:', req.body);
  
  try {
    const userData = req.body || {};
    
    // Extract fields with fallbacks for Azure B2C and standard formats
    const name = userData.name || userData.fullName || userData.full_name || userData.displayName || userData.username || '';
    const company = userData.company || userData.companyName || userData.company_name || '';
    const email = userData.email || userData.emailAddress || userData.email_address || userData.mail || '';
    const password = userData.password || userData.pwd || userData.pass || 
                    (userData.passwordProfile && userData.passwordProfile.password) || '';
    
    console.log('Extracted fields:', { 
      name: name || '(empty)',
      company: company || '(empty)',
      email: email || '(empty)',
      hasPassword: !!password
    });
    
    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!company) missingFields.push('company');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    
    if (missingFields.length > 0) {
      console.warn(`Missing required fields: ${missingFields.join(', ')}`);
      console.log('Available fields:', Object.keys(userData));
      
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        details: { 
          missingFields,
          receivedFields: Object.keys(userData),
          sampleMapping: {
            name: 'displayName, fullName, or name',
            company: 'companyName or company',
            email: 'mail, emailAddress, or email',
            password: 'passwordProfile.password or password'
          }
        }
      });
    }
    
    console.log('Proceeding with registration...');
      // Try to register with Supabase
    if (!supabaseService) {
      console.error('Supabase service not available');
      return res.status(500).json({
        error: 'Registration service unavailable',
        message: 'Supabase service is not properly configured'
      });
    }
    
    console.log('Attempting registration with Supabase...');
    try {
      const user = await supabaseService.createUser({ name, company, email, password });
      console.log('Supabase registration successful for:', email);
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          name: name,
          company: company,
          email: email,
          role: 'recruiter'
        }
      });
    } catch (supabaseError) {
      console.error('Supabase registration failed:', supabaseError.message);
      
      // Return the actual error instead of falling back
      let statusCode = 500;
      let errorMessage = supabaseError.message;
      
      // Map specific errors to appropriate HTTP status codes
      if (errorMessage.includes('User already exists') || errorMessage.includes('already registered')) {
        statusCode = 409; // Conflict
      } else if (errorMessage.includes('Invalid API key') || errorMessage.includes('401')) {
        statusCode = 500; // Server configuration error
      } else if (errorMessage.includes('database configuration') || errorMessage.includes('Database error')) {
        statusCode = 500; // Server configuration error
      }
      
      return res.status(statusCode).json({
        error: 'Registration failed',
        message: errorMessage,
        details: {
          service: 'Supabase',
          email: email,
          timestamp: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Server error processing registration',
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Login endpoint - Simplified with fallback
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Try to authenticate with Supabase if available
    if (supabaseService) {
      console.log('Attempting authentication with Supabase...');
      try {
        const session = await supabaseService.authenticateUser(email, password);
        if (session && session.user) {
          console.log('Supabase authentication successful for:', email);
          return res.status(200).json({
            user: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || email.split('@')[0],
              company: session.user.user_metadata?.company || 'N/A',
              role: 'recruiter'
            },
            token: session.access_token,
            userType: 'recruiter'
          });
        }
      } catch (supabaseError) {
        console.error('Supabase authentication failed:', supabaseError.message);
        // Fall through to demo mode
      }
    }

    // Demo mode fallback - allows any email/password combination
    console.log('Using demo authentication');
    res.status(200).json({
      user: {
        id: `demo-${Date.now()}`,
        email: email,
        name: email.split('@')[0],
        company: 'Demo Company',
        role: 'recruiter'
      },
      token: `demo-token-${Date.now()}`,
      userType: 'recruiter'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error processing login',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Catch 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requested: req.originalUrl,
    available: ['/api/health', '/api/test', '/api/register', '/api/login']
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`API server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Supabase service: ${supabaseService ? 'Available' : 'Fallback mode'}`);
});

module.exports = app;
