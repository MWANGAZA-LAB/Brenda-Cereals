'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
export default function CheckoutPage() {
    const { data: session } = useSession();
    const { cart, clearCart } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('MPESA');
    const [deliveryInfo, setDeliveryInfo] = useState({
        phone: session?.user?.phone || '',
        address: '',
        location: {
            lat: -1.2921,
            lng: 36.8219,
            address: 'Nairobi, Kenya'
        }
    });
    const deliveryFee = 200; // KSh 200 standard delivery
    const total = cart.total + deliveryFee;
    useEffect(() => {
        if (cart.itemCount === 0) {
            router.push('/');
        }
    }, [cart.itemCount, router]);
    const handleCreateOrder = async () => {
        if (!session) {
            router.push('/auth/signin');
            return;
        }
        if (!deliveryInfo.phone || !deliveryInfo.address) {
            setError('Please fill in all delivery information');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // Create order
            const orderResponse = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.items,
                    deliveryInfo,
                    paymentMethod,
                    total,
                    deliveryFee,
                }),
            });
            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }
            const order = await orderResponse.json();
            // Clear cart
            clearCart();
            // Redirect to payment
            router.push(`/payment/${order.id}?method=${paymentMethod}`);
        }
        catch (error) {
            console.error('Order creation error:', error);
            setError('Failed to create order. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    if (cart.itemCount === 0) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Your cart is empty" }), _jsx(Link, { href: "/", className: "bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700", children: "Continue Shopping" })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800 mb-8", children: "Checkout" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Order Summary" }), _jsx("div", { className: "space-y-4", children: cart.items.map((item) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-16 h-16 relative", children: _jsx(Image, { src: item.image, alt: item.name, fill: true, style: { objectFit: 'cover' }, className: "rounded" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-medium", children: item.name }), _jsxs("p", { className: "text-sm text-gray-600", children: [item.weight, " \u00D7 ", item.quantity] })] }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: "font-semibold", children: ["KSh ", (item.price * item.quantity).toLocaleString()] }) })] }, `${item.id}-${item.weight}`))) }), _jsxs("div", { className: "border-t mt-4 pt-4 space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { children: ["KSh ", cart.total.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Delivery Fee:" }), _jsxs("span", { children: ["KSh ", deliveryFee.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between font-bold text-lg border-t pt-2", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { children: ["KSh ", total.toLocaleString()] })] })] })] }), _jsxs("div", { className: "space-y-6", children: [!session && (_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsxs("p", { className: "text-yellow-800", children: ["Please", ' ', _jsx(Link, { href: "/auth/signin", className: "font-semibold underline", children: "sign in" }), ' ', "to complete your order."] }) })), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Delivery Information" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Phone Number" }), _jsx("input", { type: "tel", value: deliveryInfo.phone, onChange: (e) => setDeliveryInfo(prev => ({ ...prev, phone: e.target.value })), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500", placeholder: "254712345678", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Delivery Address" }), _jsx("textarea", { value: deliveryInfo.address, onChange: (e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value })), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500", rows: 3, placeholder: "Enter your full delivery address", required: true })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Payment Method" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center space-x-3 cursor-pointer", children: [_jsx("input", { type: "radio", name: "paymentMethod", value: "MPESA", checked: paymentMethod === 'MPESA', onChange: (e) => setPaymentMethod(e.target.value), className: "text-green-600" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Image, { src: "/mpesa-logo.png", alt: "M-Pesa", width: 40, height: 24 }), _jsx("span", { className: "font-medium", children: "M-Pesa" })] })] }), _jsxs("label", { className: "flex items-center space-x-3 cursor-pointer", children: [_jsx("input", { type: "radio", name: "paymentMethod", value: "BITCOIN", checked: paymentMethod === 'BITCOIN', onChange: (e) => setPaymentMethod(e.target.value), className: "text-green-600" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Image, { src: "/bitcoin-logo.png", alt: "Bitcoin", width: 32, height: 32 }), _jsx("span", { className: "font-medium", children: "Bitcoin" })] })] })] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md", children: error })), _jsx("button", { onClick: handleCreateOrder, disabled: isLoading || !session, className: "w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors", children: isLoading ? 'Creating Order...' : `Place Order - KSh ${total.toLocaleString()}` })] })] })] }) }));
}
