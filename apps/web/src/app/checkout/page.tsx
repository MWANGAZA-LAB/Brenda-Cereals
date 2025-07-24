'use client';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import PaymentMethodSelector from '../../components/PaymentMethodSelector';

const locations = [
  { name: "Nairobi", delivery: 300 },
  { name: "Eldoret", delivery: 250 },
  { name: "Kisumu", delivery: 350 },
  { name: "Mombasa", delivery: 400 },
  { name: "Nakuru", delivery: 280 },
];

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [location, setLocation] = useState(locations[0]);
  const [payment, setPayment] = useState('mpesa');
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.prices[item.weight] || 0), 0);
  const total = subtotal + location.delivery;

  const createOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productName: item.name,
            quantity: 1,
            price: item.prices[item.weight],
            weight: item.weight
          })),
          subtotal,
          deliveryFee: location.delivery,
          total,
          deliveryLocation: location.name,
          deliveryAddress: {
            city: location.name,
            country: 'Kenya'
          }
        }),
      })

      if (response.ok) {
        const order = await response.json()
        setOrderId(order.id)
        setOrderCreated(true)
        return order
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Order creation error:', error)
      alert('Failed to create order. Please try again.')
    }
  }

  const handlePaymentInitiated = (paymentData: any) => {
    console.log('Payment initiated:', paymentData)
    // You can add payment status polling here
  }

  function handlePay() {
    setConfirmed(true);
    clearCart();
  }

  if (confirmed) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Thank you for your order!</h1>
        <p className="mb-2">A confirmation SMS and email will be sent shortly.</p>
        <a href="/" className="text-green-700 underline">Back to Home</a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      {/* Cart Summary */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Cart Summary</h2>
        <ul className="divide-y">
          {cart.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between py-2">
              <span>{item.name} ({item.weight})</span>
              <span className="font-semibold">Ksh {item.prices[item.weight]}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-2 font-bold">
          <span>Subtotal:</span>
          <span>Ksh {subtotal}</span>
        </div>
      </div>
      {/* Delivery Location */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Delivery Location</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={location.name}
          onChange={e => setLocation(locations.find(l => l.name === e.target.value) || locations[0])}
        >
          {locations.map(loc => (
            <option key={loc.name} value={loc.name}>{loc.name}</option>
          ))}
        </select>
        <div className="flex justify-between mt-2">
          <span>Delivery Fee:</span>
          <span className="font-semibold">Ksh {location.delivery}</span>
        </div>
      </div>
      {/* Total */}
      <div className="flex justify-between font-bold text-lg mb-6">
        <span>Total:</span>
        <span className="text-green-700">Ksh {total}</span>
      </div>

      {/* Payment Section */}
      {!orderCreated ? (
        <button
          className="w-full py-3 rounded bg-green-600 text-white font-semibold text-lg disabled:bg-gray-300"
          onClick={createOrder}
          disabled={cart.length === 0}
        >
          Create Order & Proceed to Payment
        </button>
      ) : orderId ? (
        <PaymentMethodSelector 
          total={total}
          orderId={orderId}
          onPaymentInitiated={handlePaymentInitiated}
        />
      ) : (
        <div className="text-center py-4">
          <p>Creating your order...</p>
        </div>
      )}
    </div>
  );
} 