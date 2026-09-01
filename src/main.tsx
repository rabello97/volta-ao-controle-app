import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/queryClient";
import { purgeLegacyCaches } from "@/lib/pwa";
import { AuthProvider } from "@/context/AuthContext";
import { HouseholdViewProvider } from "@/context/HouseholdViewContext";
import { MonthProvider } from "@/context/MonthContext";
import { App } from "@/App";
import "./index.css";

void purgeLegacyCaches();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <GoogleOAuthProvider clientId={googleClientId}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <HouseholdViewProvider>
                <MonthProvider>
                <App />
                <Toaster />
                </MonthProvider>
              </HouseholdViewProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
