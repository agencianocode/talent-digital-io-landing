import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SupabaseAuthProvider>
        <CompanyProvider>
          <App />
          <Toaster />
        </CompanyProvider>
      </SupabaseAuthProvider>
    </ThemeProvider>
  </StrictMode>,
);