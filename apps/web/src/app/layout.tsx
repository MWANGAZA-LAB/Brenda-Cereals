'use client';
// import type { Metadata } from "next"; // Commented out as not currently used
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';

// Using reliable system fonts instead of Google Fonts to avoid network timeouts
const systemFonts = {
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Your trusted source for wholesome Kenyan grains" />
        <title>Brenda Cereals</title>
        
        {/* Mobile-specific meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Brenda Cereals" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple touch icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body 
        className="bg-white text-gray-900 min-h-screen"
        style={{ 
          fontFamily: systemFonts.sans,
          '--font-mono': systemFonts.mono 
        } as React.CSSProperties}
      >
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <CartProvider>
              {children}
            </CartProvider>
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
