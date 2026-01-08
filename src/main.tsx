// src/main.tsx（置き換え）
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppRouter from '@/routes/AppRouter';
import { AuthProvider } from '@/providers/AuthProvider';
import { AgeVerificationProvider } from '@/contexts/AgeVerificationContext';
import { Toaster } from 'sonner';
import AnalyticsListener from '@/components/common/AnalyticsListener';
import '@/index.css';

function loadAutolingual() {
  const id = import.meta.env.VITE_AUTOLINGUAL_ID as string | undefined;
  if (!id) return;

  const existing = document.querySelector(`script[data-autolingual-id="${id}"]`);
  if (existing) return;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://cdn.autolingual.io/autolingualjs/v1.0.0/autolingual.js?id=${encodeURIComponent(id)}`;
  s.setAttribute("data-autolingual-id", id);
  document.head.appendChild(s);
}

loadAutolingual();

// ブラウザのスクロール復元を無効化（手動で制御するため）
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <HelmetProvider>
    <BrowserRouter>
      <AnalyticsListener />
      <AgeVerificationProvider>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-center" />
        </AuthProvider>
      </AgeVerificationProvider>
    </BrowserRouter>
  </HelmetProvider>
  // </React.StrictMode>
);
