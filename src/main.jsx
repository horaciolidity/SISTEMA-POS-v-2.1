// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { POSProvider } from '@/contexts/POSContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <POSProvider>
          <App />
        </POSProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
