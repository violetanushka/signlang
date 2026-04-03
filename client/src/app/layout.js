import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import ClientProviders from "@/components/providers/ClientProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Signa — AI Sign Language Learning",
  description: "Learn sign language with AI-powered real-time gesture recognition. Accessible, gamified, and fun for everyone.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Learn sign language with AI-powered real-time gesture recognition. Accessible, gamified, and fun for everyone." />
        <title>Signa — AI Sign Language Learning</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Script src="/mediapipe/hands.js" strategy="beforeInteractive" />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ClientProviders>
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
