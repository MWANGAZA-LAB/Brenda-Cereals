'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

interface DeliveryInfo {
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'BITCOIN'>('MPESA');
  
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
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

    } catch (error) {
      console.error('Order creation error:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <Link href="/" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={`${item.id}-${item.weight}`} className="flex items-center space-x-4">
                  <div className="w-16 h-16 relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.weight} × {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">KSh {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>KSh {cart.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>KSh {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>KSh {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="space-y-6">
            {/* Authentication Check */}
            {!session && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Please{' '}
                  <Link href="/auth/signin" className="font-semibold underline">
                    sign in
                  </Link>{' '}
                  to complete your order.
                </p>
              </div>
            )}

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="254712345678"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Enter your full delivery address"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MPESA"
                    checked={paymentMethod === 'MPESA'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'MPESA')}
                    className="text-green-600"
                  />
                  <div className="flex items-center space-x-2">
                    <Image src="/mpesa-logo.png" alt="M-Pesa" width={40} height={24} />
                    <span className="font-medium">M-Pesa</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BITCOIN"
                    checked={paymentMethod === 'BITCOIN'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'BITCOIN')}
                    className="text-green-600"
                  />
                  <div className="flex items-center space-x-2">
                    <Image src="/bitcoin-logo.png" alt="Bitcoin" width={32} height={32} />
                    <span className="font-medium">Bitcoin</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handleCreateOrder}
              disabled={isLoading || !session}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Creating Order...' : `Place Order - KSh ${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 