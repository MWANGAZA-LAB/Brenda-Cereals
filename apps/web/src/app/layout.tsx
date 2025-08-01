'use client';
import type { Metadata } from "next";
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
