'use client';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} bg-white text-gray-900 min-h-screen`}>
        <QueryClientProvider client={queryClient}>
          <CartProvider>
            {children}
          </CartProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
