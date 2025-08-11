'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export default function RootLayout({ children, }) {
    const [queryClient] = useState(() => new QueryClient());
    return (_jsxs("html", { lang: "en", children: [_jsxs("head", { children: [_jsx("link", { rel: "icon", href: "/favicon.ico" }), _jsx("meta", { name: "description", content: "Your trusted source for wholesome Kenyan grains" }), _jsx("title", { children: "Brenda Cereals" })] }), _jsx("body", { className: "bg-white text-gray-900 min-h-screen", style: {
                    fontFamily: systemFonts.sans,
                    '--font-mono': systemFonts.mono
                }, children: _jsx(SessionProvider, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(CartProvider, { children: children }) }) }) })] }));
}
