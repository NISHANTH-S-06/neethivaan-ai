import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AppProviders } from '@/components/providers/AppProviders';
import { Manrope, Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'Neethivaan - Legal AI',
  description: 'AI-powered legal assistance system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", manrope.variable, inter.variable)}>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground font-inter">
        <AppProviders>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
