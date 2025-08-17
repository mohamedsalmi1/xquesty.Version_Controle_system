import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { addHealthCheck } from "./health-check.js";

const app = express();
const port = process.env.PORT || 3000;

// Import the new Supabase auth helper
const authHelper = require('./authHelper');

// CORS configuration
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost", "http://frontend"],
  methods: ["GET", "POST", "OPTIONS", "HEAD"], 
  allowedHeaders: ["Content-Type", "Authorization"] 
}));

app.use(bodyParser.json());

// Check middleware to log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} received`);
  next();
});

// Add health check endpoints
addHealthCheck(app);

// Register endpoint - Updated for Supabase
app.post("/api/register", async (req, res) => {
  const { name, company, email, password } = req.body;

  if (!name || !company || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Create user with Supabase
    const user = await authHelper.createUser({ name, company, email, password });
    
    console.log("User created successfully in Supabase:", user.id);
    res.status(200).json({ 
      message: "User registered successfully.",
      user: {
        id: user.id,
        email: user.email,
        name: name,
        company: company,
        role: "recruiter"
      }
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({
      message: "Failed to register user.",
      error: error.message,
    });
  }
});

// Login endpoint - Updated for Supabase
app.post("/api/login", async (req, res) => {
  console.log("Login attempt received:", req.body.email);
  
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Authenticate user with Supabase
    const session = await authHelper.authenticateUser(email, password);
    
    if (!session) {
      console.log("Authentication failed for:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const user = session.user;
    console.log("Authentication successful for:", email);
    
    // Create a simple token
    const token = authHelper.generateSessionToken(user.id);
    
    // Return success response
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || email.split('@')[0],
        company: user.user_metadata?.company || 'N/A',
        role: "recruiter"
      },
      token: token,
      userType: 'recruiter'
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ 
      message: "Login failed", 
      error: error.message 
    });
  }
});
// Error handler for requests to undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found", 
    path: req.path,
    method: req.method
  });
});

// --- Interview backend endpoints ---
let latestQuestion = null;
let latestQuestionTimestamp = null;

// Receive a new interview question (from n8n or external workflow)
app.post('/receive-question', (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ message: 'Missing question in request body.' });
  }
  latestQuestion = question;
  latestQuestionTimestamp = Date.now();
  console.log('Received new interview question:', question);
  res.status(200).json({ message: 'Question received.' });
});

// Poll for the latest interview question (used by React frontend)
app.get('/api/latest-question', (req, res) => {
  if (!latestQuestion) {
    return res.status(404).json({ message: 'No question available.' });
  }
  res.status(200).json({ question: latestQuestion, timestamp: latestQuestionTimestamp });
});

// Optionally, endpoint to clear the latest question (if you want to mark it as consumed)
app.post('/api/clear-question', (req, res) => {
  latestQuestion = null;
  latestQuestionTimestamp = null;
  res.status(200).json({ message: 'Latest question cleared.' });
});

// Example endpoint to receive interview answers (for n8n or logging)
app.post('/api/receive-answer', (req, res) => {
  const { answer } = req.body;
  if (!answer) {
    return res.status(400).json({ message: 'Missing answer in request body.' });
  }
  console.log('Received interview answer:', answer);
  // You can add logic here to forward to n8n, store in DB, etc.
  res.status(200).json({ message: 'Answer received.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Available endpoints:`);
  console.log(`- GET/HEAD /api/health - Check server health`);
  console.log(`- POST /api/register - Register new users`);
  console.log(`- POST /api/login - Authenticate users`);
  console.log(`- POST /receive-question - Receive interview question (from n8n)`);
  console.log(`- GET /api/latest-question - Poll for latest interview question`);
  console.log(`- POST /api/clear-question - Clear latest question`);
  console.log(`- POST /api/receive-answer - Receive interview answer`);
});
