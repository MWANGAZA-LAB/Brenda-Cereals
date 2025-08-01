'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  qrCode?: string;
  address?: string;
  amount?: number;
  checkoutRequestId?: string;
  message?: string;
  error?: string;
}

interface OrderData {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  items: Array<{
    productName: string;
    productImage: string;
    weight: string;
    quantity: number;
    totalPrice: number;
  }>;
}

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const orderId = params.orderId as string;
  const paymentMethod = searchParams.get('method') as 'MPESA' | 'BITCOIN';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const orderData = await response.json();
          setOrder(orderData);
        } else {
          setError('Order not found');
        }
      } catch (error) {
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
            } else if (status.status === 'FAILED') {
              setPaymentStatus('failed');
              clearInterval(pollPayment);
            }
          }
        } catch (error) {
          console.error('Payment status check failed:', error);
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(pollPayment);
    }
  }, [paymentStatus, orderId]);

  const initiatePayment = async () => {
    if (!order) return;

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
      } else {
        setError(result.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError('Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to view this page</p>
          <Link href="/auth/signin" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your order #{orderId} has been confirmed and will be processed shortly.</p>
          <div className="space-y-3">
            <Link 
              href="/account/orders" 
              className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              View Orders
            </Link>
            <Link 
              href="/" 
              className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <h1 className="text-2xl font-bold">Complete Payment</h1>
            <p className="text-green-100">Order #{orderId}</p>
          </div>

          {/* Order Summary */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 h-12 relative">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">{item.weight} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold">KSh {item.totalPrice.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>KSh {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Image 
                src={paymentMethod === 'MPESA' ? '/mpesa-logo.png' : '/bitcoin-logo.png'} 
                alt={paymentMethod} 
                width={paymentMethod === 'MPESA' ? 40 : 32} 
                height={paymentMethod === 'MPESA' ? 24 : 32} 
              />
              <h2 className="text-lg font-semibold">
                Pay with {paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bitcoin'}
              </h2>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {/* Payment Form */}
            {paymentStatus === 'pending' && (
              <div className="space-y-4">
                {paymentMethod === 'MPESA' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="254712345678"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Enter your M-Pesa registered phone number
                    </p>
                  </div>
                )}

                <button
                  onClick={initiatePayment}
                  disabled={isLoading || (paymentMethod === 'MPESA' && !phoneNumber)}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {isLoading ? 'Processing...' : `Pay KSh ${order.total.toLocaleString()}`}
                </button>
              </div>
            )}

            {/* Payment Processing */}
            {paymentStatus === 'processing' && paymentData && (
              <div className="text-center">
                {paymentMethod === 'MPESA' ? (
                  <div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2">M-Pesa Payment Initiated</h3>
                    <p className="text-gray-600 mb-4">
                      Check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Amount:</strong> KSh {order.total.toLocaleString()}<br/>
                        <strong>Paybill:</strong> 174379<br/>
                        <strong>Phone:</strong> {phoneNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Bitcoin Payment</h3>
                    {paymentData.qrCode && (
                      <div className="mb-4">
                        <img 
                          src={paymentData.qrCode} 
                          alt="Bitcoin QR Code" 
                          className="mx-auto w-48 h-48 border rounded-lg"
                        />
                      </div>
                    )}
                    <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-800 break-all">
                        <strong>Address:</strong><br/>
                        {paymentData.address}
                      </p>
                      <p className="text-sm text-gray-800 mt-2">
                        <strong>Amount:</strong> {paymentData.amount} BTC
                      </p>
                    </div>
                    <div className="animate-pulse text-blue-600">
                      <p>Waiting for Bitcoin payment confirmation...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Failed */}
            {paymentStatus === 'failed' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Payment Failed</h3>
                <p className="text-gray-600 mb-4">
                  There was an issue processing your payment. Please try again.
                </p>
                <button
                  onClick={() => {
                    setPaymentStatus('pending');
                    setPaymentData(null);
                    setError('');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
