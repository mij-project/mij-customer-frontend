// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AppRouter from "@/routes/AppRouter";
import { AuthProvider } from "@/providers/AuthProvider";
import { AgeVerificationProvider } from "@/contexts/AgeVerificationContext";
import { Toaster } from "sonner";
import AnalyticsListener from "@/components/common/AnalyticsListener";
import LanguageAutoTimezone from "@/components/common/LanguageAutoTimezone";
import LanguageSwitchers from "@/components/common/LanguageSwitchers";

import "@/index.css";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <LanguageSwitchers />
    <LanguageAutoTimezone>
      <BrowserRouter>
        <AnalyticsListener />
        <AgeVerificationProvider>
          <AuthProvider>
            <AppRouter />
            <Toaster position="top-center" />
          </AuthProvider>
        </AgeVerificationProvider>
      </BrowserRouter>
    </LanguageAutoTimezone>
  </HelmetProvider>
);
