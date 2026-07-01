import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Apply theme before paint to avoid flash
(function applyInitialTheme() {
  const stored = localStorage.getItem('chronos-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme = stored ?? (prefersLight ? 'light' : 'dark');
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('chronos-theme', theme);
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);