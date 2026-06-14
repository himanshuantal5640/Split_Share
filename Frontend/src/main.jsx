import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Diagnostic global error handler to capture blank screen crashes
window.addEventListener('error', (event) => {
  const errorContainer = document.createElement('div');
  errorContainer.style.position = 'fixed';
  errorContainer.style.top = '0';
  errorContainer.style.left = '0';
  errorContainer.style.width = '100vw';
  errorContainer.style.height = '100vh';
  errorContainer.style.backgroundColor = '#1a0505';
  errorContainer.style.color = '#ff8080';
  errorContainer.style.padding = '20px';
  errorContainer.style.zIndex = '99999';
  errorContainer.style.overflow = 'auto';
  errorContainer.style.fontFamily = 'monospace';
  errorContainer.style.fontSize = '14px';
  errorContainer.innerHTML = `
    <h2 style="color: #ff3333; margin-bottom: 10px;">Uncaught Runtime Error:</h2>
    <pre style="white-space: pre-wrap; word-break: break-all;">${event.error ? event.error.stack : event.message}</pre>
  `;
  document.body.appendChild(errorContainer);
});

window.addEventListener('unhandledrejection', (event) => {
  const errorContainer = document.createElement('div');
  errorContainer.style.position = 'fixed';
  errorContainer.style.top = '0';
  errorContainer.style.left = '0';
  errorContainer.style.width = '100vw';
  errorContainer.style.height = '100vh';
  errorContainer.style.backgroundColor = '#1a0505';
  errorContainer.style.color = '#ff8080';
  errorContainer.style.padding = '20px';
  errorContainer.style.zIndex = '99999';
  errorContainer.style.overflow = 'auto';
  errorContainer.style.fontFamily = 'monospace';
  errorContainer.style.fontSize = '14px';
  errorContainer.innerHTML = `
    <h2 style="color: #ff3333; margin-bottom: 10px;">Unhandled Promise Rejection:</h2>
    <pre style="white-space: pre-wrap; word-break: break-all;">${event.reason ? (event.reason.stack || event.reason) : 'No reason provided'}</pre>
  `;
  document.body.appendChild(errorContainer);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
