// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

// 🧠 Punto de entrada principal del sistema POS
// - Aplica tema global (claro/oscuro)
// - App.jsx se encarga de AuthProvider y POSProvider internamente

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
