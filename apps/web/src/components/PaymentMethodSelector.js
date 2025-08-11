'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { FaMobile, FaBitcoin, FaCreditCard } from 'react-icons/fa';
export default function PaymentMethodSelector({ total, orderId, onPaymentInitiated }) {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentData, setPaymentData] = useState(null);
    const initiatePayment = async () => {
        if (!selectedMethod)
            return;
        setLoading(true);
        try {
            if (selectedMethod === 'mpesa') {
                if (!phoneNumber) {
                    alert('Please enter your phone number');
                    setLoading(false);
                    return;
                }
                const response = await fetch('/api/payments/mpesa/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNumber,
                        amount: total,
                        orderId
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    setPaymentData(data);
                    onPaymentInitiated(data);
                }
                else {
                    alert(data.message || 'Payment initiation failed');
                }
            }
            else if (selectedMethod === 'safaricom_paybill') {
                if (!phoneNumber) {
                    alert('Please enter your phone number');
                    setLoading(false);
                    return;
                }
                const response = await fetch('/api/payments/safaricom-paybill/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNumber,
                        orderId
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    setPaymentData(data);
                    onPaymentInitiated(data);
                }
                else {
                    alert(data.error || 'Payment initiation failed');
                }
            }
            else if (selectedMethod === 'bitcoin_wallet') {
                const response = await fetch('/api/payments/bitcoin-wallet/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    setPaymentData(data);
                    onPaymentInitiated(data);
                }
                else {
                    alert(data.error || 'Payment initiation failed');
                }
            }
        }
        catch (error) {
            console.error('Payment error:', error);
            alert('Payment initiation failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-md mx-auto bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Select Payment Method" }), _jsxs("p", { className: "text-gray-600 mb-6", children: ["Total Amount: Ksh ", total.toLocaleString()] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: `border rounded-lg p-4 cursor-pointer transition-colors ${selectedMethod === 'mpesa'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'}`, onClick: () => setSelectedMethod('mpesa'), children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FaMobile, { className: "text-green-600 text-xl" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: "M-Pesa" }), _jsx("p", { className: "text-sm text-gray-600", children: "Pay with your mobile money" })] })] }), selectedMethod === 'mpesa' && (_jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Phone Number" }), _jsx("input", { type: "tel", placeholder: "0712345678", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value) })] }))] }), _jsxs("div", { className: `border rounded-lg p-4 cursor-pointer transition-colors ${selectedMethod === 'safaricom_paybill'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'}`, onClick: () => setSelectedMethod('safaricom_paybill'), children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FaCreditCard, { className: "text-blue-600 text-xl" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: "Safaricom Paybill" }), _jsx("p", { className: "text-sm text-gray-600", children: "Pay directly to paybill number" })] })] }), selectedMethod === 'safaricom_paybill' && (_jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Phone Number" }), _jsx("input", { type: "tel", placeholder: "0712345678", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value) })] }))] }), _jsx("div", { className: `border rounded-lg p-4 cursor-pointer transition-colors ${selectedMethod === 'bitcoin_wallet'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'}`, onClick: () => setSelectedMethod('bitcoin_wallet'), children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FaBitcoin, { className: "text-orange-500 text-xl" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: "Bitcoin Wallet" }), _jsx("p", { className: "text-sm text-gray-600", children: "Pay with Bitcoin via QR code" })] })] }) })] }), selectedMethod && (_jsx("button", { onClick: initiatePayment, disabled: loading, className: "w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Initiating Payment...' : 'Proceed to Payment' })), paymentData && (_jsxs("div", { className: "mt-6 p-4 bg-blue-50 rounded-lg", children: [selectedMethod === 'mpesa' && (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-blue-800 mb-2", children: "M-Pesa Payment Initiated" }), _jsx("p", { className: "text-sm text-blue-700", children: "Check your phone for the M-Pesa prompt and enter your PIN to complete the payment." })] })), selectedMethod === 'safaricom_paybill' && (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-blue-800 mb-2", children: "Safaricom Paybill Payment" }), _jsxs("div", { className: "space-y-2 text-sm text-blue-700", children: [_jsxs("p", { children: [_jsx("strong", { children: "Paybill Number:" }), " ", paymentData.paybillInstructions?.paybillNumber] }), _jsxs("p", { children: [_jsx("strong", { children: "Account Number:" }), " ", paymentData.orderId || 'Your Order ID'] }), _jsxs("div", { className: "mt-3", children: [_jsx("p", { className: "font-medium mb-2", children: "Instructions:" }), _jsx("ol", { className: "list-decimal list-inside space-y-1", children: paymentData.paybillInstructions?.instructions?.map((instruction, index) => (_jsx("li", { className: "text-xs", children: instruction }, index))) })] }), _jsx("div", { className: "mt-3 p-2 bg-yellow-100 rounded", children: _jsx("p", { className: "text-xs text-yellow-800", children: "After payment, you'll receive an SMS confirmation. Enter the confirmation code to complete your order." }) })] })] })), selectedMethod === 'bitcoin_wallet' && (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-blue-800 mb-2", children: "Bitcoin Wallet Payment" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("p", { children: [_jsx("strong", { children: "Amount:" }), " ", paymentData.formattedAmount] }), _jsxs("p", { className: "break-all", children: [_jsx("strong", { children: "Address:" }), " ", paymentData.walletAddress] }), paymentData.qrCodeImage && (_jsxs("div", { className: "mt-3 text-center", children: [_jsx("img", { src: paymentData.qrCodeImage, alt: "Bitcoin Payment QR Code", className: "mx-auto w-48 h-48 border rounded" }), _jsx("p", { className: "mt-2 text-xs text-gray-600", children: "Scan with your Bitcoin wallet" })] })), _jsxs("div", { className: "mt-3", children: [_jsx("p", { className: "font-medium mb-1", children: "Instructions:" }), _jsx("ul", { className: "list-disc list-inside space-y-1", children: paymentData.instructions?.map((instruction, index) => (_jsx("li", { className: "text-xs", children: instruction }, index))) })] })] })] }))] }))] }));
}
