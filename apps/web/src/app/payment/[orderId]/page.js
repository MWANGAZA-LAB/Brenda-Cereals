'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
export default function PaymentPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    // const router = useRouter(); // Commented out as not currently used
    const { data: session } = useSession();
    const orderId = params.orderId;
    const paymentMethod = searchParams.get('method');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [phoneNumber, setPhoneNumber] = useState('');
    // Fetch order details
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (response.ok) {
                    const responseData = await response.json();
                    if (responseData.success && responseData.order) {
                        // Transform the order data to match the expected interface
                        const orderData = {
                            id: responseData.order.id,
                            total: responseData.order.total,
                            status: responseData.order.status,
                            paymentMethod: responseData.order.paymentMethod,
                            items: responseData.order.orderItems?.map((item) => ({
                                productName: item.product?.name || 'Unknown Product',
                                productImage: item.product?.image || '',
                                weight: item.product?.weight || '',
                                quantity: item.quantity,
                                totalPrice: item.totalPrice,
                            })) || []
                        };
                        setOrder(orderData);
                    }
                    else {
                        setError('Invalid order data');
                    }
                }
                else {
                    setError('Order not found');
                }
            }
            catch (error) {
                console.error('Failed to fetch order:', error);
                setError('Failed to load order details');
            }
        };
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);
    // Poll payment status
    useEffect(() => {
        if (paymentStatus === 'processing') {
            const pollPayment = setInterval(async () => {
                try {
                    const response = await fetch(`/api/payments/status/${orderId}`);
                    if (response.ok) {
                        const status = await response.json();
                        if (status.status === 'COMPLETED') {
                            setPaymentStatus('completed');
                            clearInterval(pollPayment);
                        }
                        else if (status.status === 'FAILED') {
                            setPaymentStatus('failed');
                            clearInterval(pollPayment);
                        }
                    }
                }
                catch (error) {
                    console.error('Payment status check failed:', error);
                }
            }, 5000); // Check every 5 seconds
            return () => clearInterval(pollPayment);
        }
        return undefined;
    }, [paymentStatus, orderId]);
    const initiatePayment = async () => {
        if (!order)
            return;
        setIsLoading(true);
        setError('');
        try {
            const endpoint = paymentMethod === 'MPESA'
                ? '/api/payments/mpesa/initiate'
                : '/api/payments/bitcoin/initiate';
            const body = paymentMethod === 'MPESA'
                ? { orderId, phoneNumber, amount: order.total }
                : { orderId, amount: order.total };
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            if (result.success) {
                setPaymentData(result);
                setPaymentStatus('processing');
            }
            else {
                setError(result.error || 'Payment initiation failed');
            }
        }
        catch (error) {
            console.error('Payment initiation error:', error);
            setError('Failed to initiate payment');
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!session) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Access Denied" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Please sign in to view this page" }), _jsx(Link, { href: "/auth/signin", className: "bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700", children: "Sign In" })] }) }));
    }
    if (!order) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading order details..." })] }) }));
    }
    if (paymentStatus === 'completed') {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8", children: [_jsx("div", { className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Payment Successful!" }), _jsxs("p", { className: "text-gray-600 mb-6", children: ["Your order #", orderId, " has been confirmed and will be processed shortly."] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Link, { href: "/account/orders", className: "block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700", children: "View Orders" }), _jsx(Link, { href: "/", className: "block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50", children: "Continue Shopping" })] })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsx("div", { className: "max-w-2xl mx-auto px-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: [_jsxs("div", { className: "bg-green-600 text-white p-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Complete Payment" }), _jsxs("p", { className: "text-green-100", children: ["Order #", orderId] })] }), _jsxs("div", { className: "p-6 border-b", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Order Summary" }), _jsx("div", { className: "space-y-3", children: order.items.map((item, index) => (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 relative", children: _jsx(Image, { src: item.productImage, alt: item.productName, fill: true, style: { objectFit: 'cover' }, className: "rounded" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: item.productName }), _jsxs("p", { className: "text-sm text-gray-600", children: [item.weight, " \u00D7 ", item.quantity] })] }), _jsxs("p", { className: "font-semibold", children: ["KSh ", item.totalPrice.toLocaleString()] })] }, index))) }), _jsx("div", { className: "mt-4 pt-4 border-t", children: _jsxs("div", { className: "flex justify-between font-bold text-lg", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { children: ["KSh ", order.total.toLocaleString()] })] }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsx(Image, { src: paymentMethod === 'MPESA' ? '/mpesa-logo.png' : '/bitcoin-logo.png', alt: paymentMethod, width: paymentMethod === 'MPESA' ? 40 : 32, height: paymentMethod === 'MPESA' ? 24 : 32 }), _jsxs("h2", { className: "text-lg font-semibold", children: ["Pay with ", paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bitcoin'] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4", children: error })), paymentStatus === 'pending' && (_jsxs("div", { className: "space-y-4", children: [paymentMethod === 'MPESA' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "M-Pesa Phone Number" }), _jsx("input", { type: "tel", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500", placeholder: "254712345678", required: true }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Enter your M-Pesa registered phone number" })] })), _jsx("button", { onClick: initiatePayment, disabled: isLoading || (paymentMethod === 'MPESA' && !phoneNumber), className: "w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors", children: isLoading ? 'Processing...' : `Pay KSh ${order.total.toLocaleString()}` })] })), paymentStatus === 'processing' && paymentData && (_jsx("div", { className: "text-center", children: paymentMethod === 'MPESA' ? (_jsxs("div", { children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "M-Pesa Payment Initiated" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Check your phone for the M-Pesa prompt and enter your PIN to complete the payment." }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Amount:" }), " KSh ", order.total.toLocaleString(), _jsx("br", {}), _jsx("strong", { children: "Paybill:" }), " 174379", _jsx("br", {}), _jsx("strong", { children: "Phone:" }), " ", phoneNumber] }) })] })) : (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Bitcoin Payment" }), paymentData.qrCode && (_jsx("div", { className: "mb-4", children: _jsx("img", { src: paymentData.qrCode, alt: "Bitcoin QR Code", className: "mx-auto w-48 h-48 border rounded-lg" }) })), _jsxs("div", { className: "bg-gray-50 border rounded-lg p-4 mb-4", children: [_jsxs("p", { className: "text-sm text-gray-800 break-all", children: [_jsx("strong", { children: "Address:" }), _jsx("br", {}), paymentData.address] }), _jsxs("p", { className: "text-sm text-gray-800 mt-2", children: [_jsx("strong", { children: "Amount:" }), " ", paymentData.amount, " BTC"] })] }), _jsx("div", { className: "animate-pulse text-blue-600", children: _jsx("p", { children: "Waiting for Bitcoin payment confirmation..." }) })] })) })), paymentStatus === 'failed' && (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-red-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-red-600 mb-2", children: "Payment Failed" }), _jsx("p", { className: "text-gray-600 mb-4", children: "There was an issue processing your payment. Please try again." }), _jsx("button", { onClick: () => {
                                            setPaymentStatus('pending');
                                            setPaymentData(null);
                                            setError('');
                                        }, className: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg", children: "Try Again" })] }))] })] }) }) }));
}
