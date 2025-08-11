'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
// import Image from 'next/image'; // Commented out as not currently used
function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });
            if (result?.error) {
                setError('Invalid email or password');
            }
            else {
                // Force session refresh
                await getSession();
                router.push(callbackUrl);
            }
        }
        catch (error) {
            console.error('Sign in error:', error);
            setError('An error occurred during sign in');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDemoLogin = async (userType) => {
        setIsLoading(true);
        setError('');
        const credentials = userType === 'admin'
            ? { email: 'admin@brendacereals.com', password: 'admin123' }
            : { email: 'customer@example.com', password: 'password123' };
        try {
            const result = await signIn('credentials', {
                email: credentials.email,
                password: credentials.password,
                redirect: false,
            });
            if (result?.error) {
                setError('Demo login failed');
            }
            else {
                await getSession();
                router.push(callbackUrl);
            }
        }
        catch (error) {
            console.error('Demo login error:', error);
            setError('Demo login failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: [_jsx("div", { className: "flex justify-center", children: _jsx(Link, { href: "/", children: _jsx("h1", { className: "text-2xl font-bold text-green-600", children: "Brenda Cereals" }) }) }), _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Sign in to your account" }), _jsxs("p", { className: "mt-2 text-center text-sm text-gray-600", children: ["Or", ' ', _jsx(Link, { href: "/auth/signup", className: "font-medium text-green-600 hover:text-green-500", children: "create a new account" })] })] }), _jsx("div", { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md", children: _jsxs("div", { className: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10", children: [_jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email address" }), _jsx("div", { className: "mt-1", children: _jsx("input", { id: "email", name: "email", type: "email", autoComplete: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm", placeholder: "Enter your email" }) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("div", { className: "mt-1", children: _jsx("input", { id: "password", name: "password", type: "password", autoComplete: "current-password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm", placeholder: "Enter your password" }) })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm", children: error })), _jsx("div", { children: _jsx("button", { type: "submit", disabled: isLoading, className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? 'Signing in...' : 'Sign in' }) })] }), _jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "px-2 bg-white text-gray-500", children: "Demo Accounts" }) })] }), _jsxs("div", { className: "mt-6 grid grid-cols-1 gap-3", children: [_jsxs("button", { onClick: () => handleDemoLogin('admin'), disabled: isLoading, className: "w-full inline-flex justify-center py-2 px-4 border border-green-300 rounded-md shadow-sm bg-white text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }), "Admin Demo (admin@brendacereals.com)"] }), _jsxs("button", { onClick: () => handleDemoLogin('customer'), disabled: isLoading, className: "w-full inline-flex justify-center py-2 px-4 border border-blue-300 rounded-md shadow-sm bg-white text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l-1.5-1.5m5.5 5.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm8.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" }) }), "Customer Demo (customer@example.com)"] })] })] }), _jsx("div", { className: "mt-6", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "px-2 bg-white text-gray-500", children: _jsx(Link, { href: "/", className: "text-green-600 hover:text-green-500", children: "\u2190 Back to store" }) }) })] }) })] }) })] }));
}
export default function SignInPage() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8", children: _jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: [_jsx("div", { className: "flex justify-center", children: _jsx("h1", { className: "text-2xl font-bold text-green-600", children: "Brenda Cereals" }) }), _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Sign in to your account" }), _jsx("div", { className: "mt-8 flex justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" }) })] }) }), children: _jsx(SignInForm, {}) }));
}
