"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthProvider } from "@/context/AuthContext";

import { LanguageProvider } from "@/context/LanguageContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
