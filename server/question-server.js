const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

const axios = require('axios'); // Add axios for HTTP requests

app.use(cors());
app.use(bodyParser.json());

// Per-student question queues and state
const studentQueues = {}; // { student_id: { queue: [questions], current: null } }
let interviewStarted = false;
let latestStudent = {};

// Endpoint to receive a new question from n8n workflow
// Receive a new question for a student
app.post('/receive-question', (req, res) => {
  const { question, student_id, stop_interview } = req.body;
  if (!student_id) {
    return res.status(400).json({ error: 'Missing student_id in request body' });
  }
  if (!studentQueues[student_id]) {
    studentQueues[student_id] = { queue: [], current: null, stop: false };
  }
  if (stop_interview === true) {
    studentQueues[student_id].stop = true;
    console.log(`Received stop_interview for student ${student_id}`);
    return res.json({ success: true });
  }
  if (!question) {
    return res.status(400).json({ error: 'Missing question in request body' });
  }
  studentQueues[student_id].queue.push(question);
  console.log(`Received new question for student ${student_id}:`, question);
  res.json({ success: true });
});

// Handle CORS preflight for /start-interview
app.options('/start-interview', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

// Endpoint to start the interview
app.post('/start-interview', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  const { body } = req.body;
  if (!body || !body.student_id || !body.name) {
    return res.status(400).json({ error: 'Missing student_id or name in request body' });
  }
  interviewStarted = true;
  latestStudent = body;
  // Initialize queue for this student
  if (!studentQueues[body.student_id]) {
    studentQueues[body.student_id] = { queue: [], current: null };
  }
  // Notify n8n workflow with direct payload (ngrok endpoint)
  const n8nWebhookUrl = 'https://questy.app.n8n.cloud/webhook/start-interview';
  axios.post(n8nWebhookUrl, {
    student_id: body.student_id,
    name: body.name,
    phone: body.phone
  })
    .then(() => {
      res.json({ success: true });
    })
    .catch((err) => {
      console.error('Error notifying n8n workflow:', err.message);
      res.status(500).json({ error: 'Failed to notify n8n workflow' });
    });
});

// Endpoint to receive an answer from the frontend
app.post('/receive-answer', (req, res) => {
  const { question, answer, name, student_id, stop_interview } = req.body;
  // If stop_interview is true, finish interview politely
  if (stop_interview === true) {
    console.log(`Interview completed for student_id: ${student_id}`);
    return res.json({
      message: `Thank you ${name}! You have completed the interview. We appreciate your time and effort.`
    });
  }
  if (!question || !answer || !name || !student_id) {
    return res.status(400).json({ error: 'Missing required fields in request body' });
  }
  // Remove the answered question from the student's queue
  if (studentQueues[student_id]) {
    if (studentQueues[student_id].current === question) {
      studentQueues[student_id].current = null;
    }
  }
  // Optionally store answers here
  console.log('Received answer:', { question, answer, name, student_id, stop_interview });

  // Forward answer to n8n webhook (ngrok endpoint)
  const n8nAnswerWebhookUrl = 'https://questy.app.n8n.cloud/webhook/receive-answer';
  axios.post(n8nAnswerWebhookUrl, {
    question,
    answer,
    name,
    student_id,
    stop_interview
  })
    .then(() => {
      res.json({ success: true });
    })
    .catch((err) => {
      console.error('Error forwarding answer to n8n workflow:', err.message);
      res.status(500).json({ error: 'Failed to forward answer to n8n workflow' });
    });
});

// Endpoint for frontend to poll the latest question
// Serve the next question for a student (by student_id query param)
app.get('/api/latest-question', (req, res) => {
  const student_id = req.query.student_id || (latestStudent && latestStudent.student_id);
  if (!student_id || !studentQueues[student_id]) {
    return res.json({ question: '' });
  }
  // If stop_interview was received for this student, signal completion
  if (studentQueues[student_id].stop === true) {
    return res.json({ stop_interview: true });
  }
  // If a question is currently being answered, return it
  if (studentQueues[student_id].current) {
    return res.json({ question: studentQueues[student_id].current });
  }
  // Otherwise, pop the next question from the queue
  const nextQuestion = studentQueues[student_id].queue.shift();
  if (nextQuestion) {
    studentQueues[student_id].current = nextQuestion;
    return res.json({ question: nextQuestion });
  }
  // No more questions
  return res.json({ question: '' });
});

app.listen(PORT, () => {
  console.log(`Question server running on port ${PORT}`);
});
