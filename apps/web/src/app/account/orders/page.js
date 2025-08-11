'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/account/orders');
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
                else {
                    throw new Error('Failed to fetch orders');
                }
            }
            catch (error) {
                console.error('Error fetching orders:', error);
                setError('Failed to load orders');
            }
            finally {
                setIsLoading(false);
            }
        };
        if (session) {
            fetchOrders();
        }
    }, [session]);
    if (status === 'loading' || isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading your orders..." })] }) }));
    }
    if (!session) {
        return null; // Will redirect via useEffect
    }
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-purple-100 text-purple-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getPaymentStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4", children: [_jsx("div", { className: "bg-white rounded-lg shadow-md p-6 mb-8", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800", children: "My Orders" }), _jsxs("p", { className: "text-gray-600 mt-1", children: ["Welcome back, ", session.user?.name || session.user?.email] })] }), _jsx(Link, { href: "/", className: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors", children: "Continue Shopping" })] }) }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6", children: error })), orders.length === 0 ? (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-8 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: "No orders yet" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Start shopping to see your orders here." }), _jsx(Link, { href: "/", className: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors", children: "Start Shopping" })] })) : (_jsx("div", { className: "space-y-6", children: orders.map((order) => (_jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: [_jsx("div", { className: "bg-gray-50 px-6 py-4 border-b", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4", children: [_jsxs("h3", { className: "font-semibold text-gray-800", children: ["Order #", order.id.substring(0, 8)] }), _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`, children: order.status }), _jsxs("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`, children: ["Payment: ", order.paymentStatus] })] }), _jsx("div", { className: "text-sm text-gray-600 mt-2 sm:mt-0", children: new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            }) })] }) }), _jsx("div", { className: "px-6 py-4", children: _jsx("div", { className: "space-y-3", children: order.items.map((item, index) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-12 h-12 relative", children: _jsx(Image, { src: item.productImage, alt: item.productName, fill: true, style: { objectFit: 'cover' }, className: "rounded" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium text-gray-800", children: item.productName }), _jsxs("p", { className: "text-sm text-gray-600", children: [item.weight, " \u00D7 ", item.quantity] })] }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: "font-semibold text-gray-800", children: ["KSh ", item.totalPrice.toLocaleString()] }) })] }, index))) }) }), _jsx("div", { className: "bg-gray-50 px-6 py-4 border-t", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("div", { className: "flex items-center space-x-4", children: _jsxs("span", { className: "text-sm text-gray-600", children: ["Payment: ", order.paymentMethod] }) }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: "font-bold text-lg text-gray-800", children: ["Total: KSh ", order.total.toLocaleString()] }) })] }) })] }, order.id))) }))] }) }));
}
