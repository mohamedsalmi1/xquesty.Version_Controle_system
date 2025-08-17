const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Store the latest question in memory (for demo)
let latestQuestion = null;
let latestStudentId = null;

// Endpoint to receive questions from n8n workflow
app.post('/receive-question', (req, res) => {
  const { student_id, question, stop_interview } = req.body;
  latestQuestion = question;
  latestStudentId = student_id;
  // You can add more logic here to notify the React frontend (e.g., via WebSocket)
  res.json({ status: 'received', question });
});

// Endpoint for React frontend to poll for the latest question
app.get('/api/latest-question', (req, res) => {
  res.json({ student_id: latestStudentId, question: latestQuestion });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
