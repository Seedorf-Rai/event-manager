import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
          success: { iconTheme: { primary: '#22d3ee', secondary: '#0f172a' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#0f172a' } }
        }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)