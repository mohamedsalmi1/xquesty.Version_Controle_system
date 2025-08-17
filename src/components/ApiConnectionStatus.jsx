import React, { useState, useEffect } from 'react';
import { getEnv } from '../utils/loadEnv';

export function ApiConnectionStatus() {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Checking connection to API server...');

  useEffect(() => {
    // Get the API URL from environment or config
    // This ensures it works both locally and in Docker
    const apiUrl = getEnv('VITE_API_URL') || 'http://localhost:3000';
    
    const checkConnection = async () => {
      try {
        // Use the health endpoint with the correct API URL
        const response = await fetch(`${apiUrl}/api/health`, { method: 'HEAD' });
        if (response.ok) {
          setStatus('connected');
          setMessage('API server is running and accessible.');
        } else {
          setStatus('error');
          setMessage(`API server responded with status: ${response.status}`);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Cannot connect to the API server. Please ensure it is running.');
        console.error('API Connection Error:', error);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className={`p-2 text-sm ${
      status === 'checking' ? 'bg-yellow-100 text-yellow-800' :
      status === 'connected' ? 'bg-green-100 text-green-800' :
      'bg-red-100 text-red-800'
    }`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${
          status === 'checking' ? 'bg-yellow-500' :
          status === 'connected' ? 'bg-green-500' :
          'bg-red-500'
        }`}></div>
        {message}
      </div>
    </div>
  );
}
