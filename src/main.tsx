// src/main.tsx（置き換え）
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppRouter from '@/routes/AppRouter';
import { AuthProvider } from '@/providers/AuthProvider';
import { AgeVerificationProvider } from '@/contexts/AgeVerificationContext';
import '@/index.css';

// ブラウザのスクロール復元を無効化（手動で制御するため）
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <HelmetProvider>
    <BrowserRouter>
      <AgeVerificationProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </AgeVerificationProvider>
    </BrowserRouter>
  </HelmetProvider>
  // </React.StrictMode>
);
