import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/index.css';

// Import Supabase clients instead of creating new ones
import { studentSupabase, recruiterSupabase } from './lib/supabaseClient';

// Try to import i18n, but continue if it fails
try {
  require('./i18n');
  console.log('i18n internationalization loaded');
} catch (error) {
  console.warn('i18n not available:', error.message);
}

// Create a root element wrapper with error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '1px solid red',
          borderRadius: '5px'
        }}>
          <h2>Something went wrong with the application.</h2>
          <p>Try refreshing the page or check the console for more details.</p>
          <pre style={{ 
            background: '#f7f7f7', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto' 
          }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Global handler for unhandled promise rejections (e.g., failed fetches)
window.addEventListener('unhandledrejection', event => {
  console.warn('Unhandled promise rejection:', event.reason);
});