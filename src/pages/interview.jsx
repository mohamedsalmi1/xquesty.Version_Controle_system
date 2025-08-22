import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isStudentAuthenticated } from '../lib/studentAuth';

const InterviewSystem = () => {
  const navigate = useNavigate();
  // Protect this page: Only allow signed-in students
  // Auth loading state
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 20; // 20 x 500ms = 10s
    const delay = 500;

    async function checkAuthWithRetry() {
      while (attempts < maxAttempts && isMounted) {
        const authed = await isStudentAuthenticated();
        if (authed) {
          // After authentication, check if student has already passed interview
          try {
            const { getCurrentStudent } = await import('../lib/studentAuth');
            const user = await getCurrentStudent();
            if (user && user.id) {
              // Import supabase client
              const { studentSupabase } = await import('../lib/supabaseClient');
              // Query student_summaries for this student_id
              const { data, error } = await studentSupabase
                .from('student_summaries')
                .select('student_id')
                .eq('student_id', user.id)
                .maybeSingle();
              if (data && data.student_id) {
                // Student has already passed interview
                setAuthLoading(false);
                setShowAlreadyPassed(true);
                return;
              }
            }
          } catch (err) {
            // Ignore error, continue as normal
          }
          setAuthLoading(false);
          return; // Authenticated, allow access
        }
        attempts++;
        await new Promise(res => setTimeout(res, delay));
      }
      // If still not authed after retries, redirect
      if (isMounted) {
        setAuthLoading(false);
        navigate('/student', { replace: true });
      }
    }
    setAuthLoading(true);
    setShowAlreadyPassed(false);
    checkAuthWithRetry();
    return () => { isMounted = false; };
  }, [navigate]);
  // State management
  const [currentStudentId, setCurrentStudentId] = useState('');
  const [currentStudentName, setCurrentStudentName] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [phone, setPhone] = useState('');
  const [isWaitingForQuestion, setIsWaitingForQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [interviewStage, setInterviewStage] = useState('start'); // 'start', 'interview', 'complete'
  const [isLoading, setIsLoading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [showAlreadyPassed, setShowAlreadyPassed] = useState(false);
  
  // Refs
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const answerTextareaRef = useRef(null);

  // Configuration
  // Use your azure question backend server URL here
  const CONFIG = {
    startWebhook: 'https://mainquesty-question.azurewebsites.net/start-interview',
    answerWebhook: 'https://mainquesty-question.azurewebsites.net/receive-answer',
    maxQuestions: 20
  };

  // Focus on name input when component mounts
  useEffect(() => {
    if (nameInputRef.current && interviewStage === 'start') {
      nameInputRef.current.focus();
    }
  }, [interviewStage]);

  // Poll backend for new questions when in interview stage
  useEffect(() => {
    let pollInterval;
    if (interviewStage === 'interview') {
      console.log('🚀 Starting polling - interviewStage:', interviewStage, 'isWaitingForQuestion:', isWaitingForQuestion);
      pollInterval = setInterval(async () => {
        if (!isWaitingForQuestion) {
          // Only log when skipping polling due to not waiting
          console.log('⏳ Not waiting for question, ignoring update. Current waiting state:', isWaitingForQuestion);
          return;
        }
        console.log(' Polling attempt started...');
        try {
          // Try multiple header combinations (ngrok headers removed, not needed for Azure)
          const headerOptions = [
            { 'User-Agent': 'curl/7.68.0' },
            { 'User-Agent': 'PostmanRuntime/7.28.0' },
            {}
          ];
          let res;
          let headerUsed = 'none';
          for (let i = 0; i < headerOptions.length; i++) {
            try {
              console.log(`📡 Trying header option ${i + 1}:`, headerOptions[i]);
              res = await fetch(`https://mainquesty-question.azurewebsites.net/api/latest-question?student_id=${encodeURIComponent(currentStudentId)}`, {
                method: 'GET',
                headers: headerOptions[i]
              });
              const contentType = res.headers.get('content-type');
              console.log(`📡 Option ${i + 1} - Status:`, res.status, 'Content-Type:', contentType);
              if (contentType && contentType.includes('application/json')) {
                headerUsed = `option-${i + 1}`;
                console.log(`✅ Success with option ${i + 1}!`);
                break;
              }
            } catch (err) {
              console.log(`❌ Option ${i + 1} failed:`, err.message);
            }
          }
          console.log('📡 Response status:', res.status, res.ok);
          console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()));
          console.log('📡 Header used:', headerUsed);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          // Get the raw text first to see what we're actually receiving
          const rawText = await res.text();
          console.log('📡 Raw response text:', rawText);
          // Check if it looks like JSON
          if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
            try {
              const data = JSON.parse(rawText);
              console.log('📡 Parsed JSON data:', data);
              // Only update if we're actually waiting for a new question
              if (data && data.question && typeof data.question === 'string' && data.question.trim()) {
                const newQuestion = data.question.trim();
                if (isWaitingForQuestion) {
                  console.log('✅ Setting new question (was waiting):', newQuestion);
                  setCurrentQuestion(newQuestion);
                  setIsWaitingForQuestion(false);
                  showStatus('New question loaded!', 'success');
                }
              } else if (data && (data.stop_interview === true || data.stop_interview === "true" || data.complete === true)) {
                console.log('🏁 Interview complete signal received');
                setInterviewStage('complete');
                setCurrentQuestion('');
                setIsWaitingForQuestion(false);
                showStatus('Interview completed successfully!', 'success');
              } else {
                console.log('❌ No valid question in response:', data);
              }
            } catch (parseError) {
              console.error('❌ JSON parsing error:', parseError);
              showStatus('Invalid response format from server', 'error');
            }
          } else {
            console.error('❌ Response is not JSON, got HTML/text:', rawText.substring(0, 200) + '...');
            showStatus('Server returned HTML instead of JSON - check your API endpoint', 'error');
          }
        } catch (err) {
          console.error('❌ Polling error:', err);
          showStatus('Connection error while fetching question', 'error');
        }
      }, 3000);
    } else {
      // Only log when not polling due to interviewStage
      console.log('🛑 Not polling - interviewStage:', interviewStage, 'isWaitingForQuestion:', isWaitingForQuestion);
    }
    return () => {
      if (pollInterval) {
        console.log('🛑 Clearing polling interval');
        clearInterval(pollInterval);
      }
    };
  }, [interviewStage, isWaitingForQuestion]);

  // Show status message
  const showStatus = (message, type = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage('');
    }, 5000);
  };

  // Get the actual Supabase user id for the logged-in student
  const generateStudentId = async () => {
    const { getCurrentStudent } = await import('../lib/studentAuth');
    const user = await getCurrentStudent();
    return user ? user.id : '';
  };

  // Start the interview
  const startInterview = async () => {
    const studentName = nameInputRef.current?.value.trim();
    const phoneValue = phoneInputRef.current?.value.trim();
    if (!studentName) {
      showStatus('Please enter your full name', 'error');
      return;
    }
    if (!phoneValue) {
      showStatus('Please enter your phone number', 'error');
      return;
    }
    if (!cvFile) {
      showStatus('Please upload your CV before starting the interview', 'error');
      return;
    }
    const defaultStudentId = await generateStudentId();
    setIsLoading(true);
    try {
      // Upload CV to Supabase Storage
      const { studentSupabase } = await import('../lib/supabaseClient');
      const fileExt = cvFile.name.split('.').pop();
      // Sanitize name: replace spaces with underscores, remove non-alphanum except underscore and dot, lowercase
      const safeName = studentName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase();
      const timestamp = Date.now();
      const filePath = `${defaultStudentId}.${safeName}.${timestamp}.${fileExt}`;
      let { error: uploadError } = await studentSupabase.storage.from('cv').upload(filePath, cvFile, {
        cacheControl: '3600',
        upsert: false
      });
      if (uploadError) {
        showStatus('Failed to upload CV: ' + uploadError.message, 'error');
        setIsLoading(false);
        return;
      }
      // Save file info in student_cvs table
      const { error: dbError } = await studentSupabase.from('student_cvs').insert([
        {
          student_id: defaultStudentId,
          file_path: filePath,
          uploaded_at: new Date().toISOString(),
          name: cvFile.name
        }
      ]);
      if (dbError) {
        showStatus('Failed to save CV info: ' + dbError.message, 'error');
        setIsLoading(false);
        return;
      }
      // Continue with interview start
      console.log('🚀 Starting interview for:', studentName, 'Phone:', phoneValue);
      const response = await fetch(CONFIG.startWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: {
            student_id: defaultStudentId,
            name: studentName,
            phone: phoneValue
          }
        })
      });
      if (response.ok) {
        console.log('✅ Interview started successfully');
        setCurrentStudentId(defaultStudentId);
        setCurrentStudentName(studentName);
        setPhone(phoneValue);
        setQuestionCount(1);
        setCurrentQuestion('');
        setAnswer('');
        setIsWaitingForQuestion(true);
        setInterviewStage('interview');
        showStatus('Interview started successfully! Waiting for first question...', 'success');
        // Try to get the first question immediately with better debugging
        setTimeout(async () => {
          try {
            console.log('🔍 Trying to fetch first question immediately...');
            // Use Azure backend for latest-question
            const res = await fetch(`https://mainquesty-question.azurewebsites.net/api/latest-question?student_id=${encodeURIComponent(currentStudentId)}`);
            console.log('🔍 Immediate fetch status:', res.status);
            const rawText = await res.text();
            console.log('🔍 Immediate fetch raw response:', rawText);
            if (rawText.trim().startsWith('{')) {
              const data = JSON.parse(rawText);
              console.log('🔍 Immediate fetch parsed data:', data);
              if (data && data.question && data.question.trim()) {
                console.log('✅ Got first question immediately:', data.question);
                setCurrentQuestion(data.question.trim());
                setIsWaitingForQuestion(false);
                showStatus('First question loaded!', 'success');
              }
            } else {
              console.log('🔍 Immediate fetch returned HTML:', rawText.substring(0, 100));
            }
          } catch (err) {
            console.log('⚠️ Could not fetch question immediately:', err.message);
          }
        }, 2000); // Wait 2 seconds before trying
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error starting interview:', error);
      showStatus('Failed to start interview. Please check your connection and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!answer.trim()) {
      showStatus('Please provide an answer before submitting', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(CONFIG.answerWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No ngrok headers needed for Azure
        },
        body: JSON.stringify({
          question: currentQuestion,
          answer: answer,
          name: currentStudentName,
          student_id: currentStudentId
        })
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData && resData.message) {
          // Interview complete message from backend
          setInterviewStage('complete');
          showStatus(resData.message, 'success');
          setAnswer('');
          setCurrentQuestion('');
          setIsWaitingForQuestion(false);
          return;
        }
        setQuestionCount(prev => prev + 1);
        setAnswer('');
        setIsWaitingForQuestion(true);
        showStatus('Answer submitted successfully! Waiting for next question...', 'success');

        // Force re-fetch latest question and update UI
        try {
          const latestRes = await fetch(`https://mainquesty-question.azurewebsites.net/api/latest-question?student_id=${encodeURIComponent(currentStudentId)}&ts=${Date.now()}`, { cache: 'no-store' });
          if (latestRes.ok) {
            const newData = await latestRes.json();
            if (newData && newData.question) {
              setCurrentQuestion(newData.question);
              setIsWaitingForQuestion(false);
              showStatus('Next question loaded!', 'success');
            }
          }
        } catch (fetchErr) {
          console.error('Error fetching latest question after answer:', fetchErr);
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      showStatus('Failed to submit answer. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle incoming questions from workflow
  const receiveQuestion = (data) => {
    console.log('Received question:', data);
    
    if (data.false === "true" || data.stop_interview === "true") {
      setInterviewStage('complete');
      showStatus('Interview completed successfully!', 'success');
    } else {
      setCurrentQuestion(data.question);
      setIsWaitingForQuestion(false);
      showStatus('New question loaded!', 'success');
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey && interviewStage === 'interview') {
        submitAnswer();
      } else if (interviewStage === 'start') {
        startInterview();
      }
    }
  };

  // Calculate progress
  const progressPercentage = Math.min((questionCount / CONFIG.maxQuestions) * 100, 100);

  if (authLoading) {
    return (
      <div style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          padding: '40px',
          textAlign: 'center',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              border: '4px solid #e1e5e9',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '10px',
              verticalAlign: 'middle'
            }}></span>
          </div>
          <div style={{ fontSize: '1.2em', color: '#333', fontWeight: 500 }}>
            Checking authentication...<br />
            <span style={{ fontSize: '0.95em', color: '#666', fontWeight: 400 }}>
              Please wait while we verify your session.
            </span>
          </div>
        </div>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (showAlreadyPassed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 py-8 px-2">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6 items-center">
          <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">You have already passed the interview!</h2>
          <p className="text-gray-700 text-center">
            Your data is accessible by companies.<br />
            If you want more information or to modify your information, please call us at <span className="font-semibold">0601095654</span>.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md mt-2"
            onClick={() => window.location.href = '/student'}
          >
            Back to Student Space
          </button>
        </div>
      </div>
    );
  }
  // Main interview UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 py-8 px-2">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        {/* Status message */}
        {statusMessage && (
          <div className={`rounded-md px-4 py-2 text-center font-medium ${statusType === 'error' ? 'bg-red-100 text-red-700' : statusType === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>{statusMessage}</div>
        )}

        {/* Interview Stages */}
        {interviewStage === 'start' && (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center">Start Your Interview</h2>
            <div className="flex flex-col gap-4">
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Full Name"
                className="border rounded-md px-3 py-2 text-base"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
              />
              <input
                ref={phoneInputRef}
                type="text"
                placeholder="Phone Number"
                className="border rounded-md px-3 py-2 text-base"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
              />
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700 mb-1">Upload your CV</label>
                <div className="flex items-center gap-3">
                  <label htmlFor="cv-upload" className={`cursor-pointer flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-md border border-blue-300 transition-colors duration-150 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}> 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                    {cvFile ? 'Change File' : 'Choose File'}
                    <input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.png,.jpg,.jpeg"
                      className="hidden"
                      disabled={isLoading}
                      onChange={e => setCvFile(e.target.files[0])}
                    />
                  </label>
                  {cvFile && (
                    <span className="text-sm text-gray-700 truncate max-w-[180px]">{cvFile.name}</span>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1">Accepted: PDF, DOC, DOCX, ODT, RTF, TXT, PNG, JPG, JPEG. Max size: 10MB.</span>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md mt-2 disabled:opacity-60"
                onClick={startInterview}
                disabled={isLoading}
              >
                {isLoading ? 'Starting...' : 'Start Interview'}
              </button>
            </div>
          </>
        )}

        {interviewStage === 'interview' && (
          <>
            <div className="flex flex-col gap-2 mb-2">
              <div className="text-sm text-gray-600">Student: <span className="font-semibold">{currentStudentName}</span></div>
              <div className="text-sm text-gray-600">Phone: <span className="font-semibold">{phone}</span></div>
              <div className="text-sm text-gray-600">Question {questionCount} of {CONFIG.maxQuestions}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">Current Question</h3>
            <div className="bg-gray-50 border rounded-md p-4 min-h-[60px] mb-2 text-gray-800">
              {currentQuestion || <span className="text-gray-400">Waiting for question...</span>}
            </div>
            <textarea
              ref={answerTextareaRef}
              className="border rounded-md px-3 py-2 text-base w-full min-h-[80px]"
              placeholder="Type your answer here..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !currentQuestion}
            />
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md mt-2 disabled:opacity-60"
              onClick={submitAnswer}
              disabled={isLoading || !answer.trim() || !currentQuestion}
            >
              {isLoading ? 'Submitting...' : 'Submit Answer (Ctrl+Enter)'}
            </button>
          </>
        )}

        {interviewStage === 'complete' && (
          <div className="flex flex-col items-center justify-center w-full" style={{fontFamily: 'SF Pro Text, SF Pro Display, Helvetica Neue, Arial, sans-serif'}}>
            <h2
              style={{
                fontFamily: 'SF Pro Display, Helvetica Neue, Arial, sans-serif',
                fontWeight: 500,
                fontSize: '28px',
                color: '#27e797ff',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                marginBottom: 16,
                textAlign: 'center'
              }}
            >
              Merci d'Être Vous.
            </h2>
            <div
              style={{
                fontFamily: 'SF Pro Text, Helvetica Neue, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '17px',
                color: '#424245',
                lineHeight: 1.47,
                maxWidth: 580,
                marginBottom: 20,
                textAlign: 'center'
              }}
            >
              Vos réponses font maintenant partie d'un système intelligent qui connecte les talents exceptionnels aux opportunités parfaites.
            </div>
            <div
              style={{
                fontFamily: 'SF Pro Text, Helvetica Neue, Arial, sans-serif',
                fontWeight: 500,
                fontSize: '17px',
                color: '#1D1D1F',
                lineHeight: 1.47,
                marginBottom: 24,
                textAlign: 'center'
              }}
            >
              La bonne connexion pourrait être juste au coin de la rue.
            </div>
            <div
              style={{
                fontFamily: 'SF Pro Text, Helvetica Neue, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '15px',
                color: '#424245',
                lineHeight: 1.4,
                marginBottom: 32,
                textAlign: 'center'
              }}
            >
              Pour toute information ou modification, contactez-nous :
              <span style={{fontWeight: 500, color: '#007AFF', marginLeft: 6, marginRight: 6, cursor: 'pointer'}} onClick={() => window.open('tel:0601095654')}>0601095654</span>
              ou
              <span style={{fontWeight: 500, color: '#007AFF', marginLeft: 6, cursor: 'pointer'}} onClick={() => window.open('tel:0654698180')}>0654-698180</span>
            </div>
            <button
              style={{
                fontFamily: 'SF Pro Text, Helvetica Neue, Arial, sans-serif',
                fontWeight: 500,
                fontSize: '17px',
                color: '#007AFF',
                background: 'transparent',
                border: '1px solid #007AFF',
                padding: '12px 24px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: 0
              }}
              onMouseOver={e => {
                e.target.style.background = '#007AFF';
                e.target.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#007AFF';
              }}
              onClick={() => window.location.href = '/student'}
            >
              Retourner à Votre Espace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSystem;