import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TestApp from './TestApp';

// テストモードを判定
const isTestMode = window.location.search.includes('test=true') || 
                   window.location.hash.includes('test') ||
                   process.env.NODE_ENV === 'development' && window.location.pathname.includes('test');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    {isTestMode ? <TestApp /> : <App />}
  </React.StrictMode>
);