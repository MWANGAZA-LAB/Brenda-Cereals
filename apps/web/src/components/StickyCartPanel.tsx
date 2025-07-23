'use client';
import { useMemo } from "react";

type CartItem = {
  id: string;
  name: string;
  image: string;
  prices: { [weight: string]: number };
  inStock: boolean;
  weight: string;
};

type Props = {
  cart: CartItem[];
  onCheckout: () => void;
};

export default function StickyCartPanel({ cart, onCheckout }: Props) {
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (item.prices[item.weight] || 0), 0),
    [cart]
  );

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-96 bg-white shadow-2xl border-t md:border-l md:border-t-0 z-50 p-4 flex flex-col gap-2 md:rounded-tl-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg">Cart</span>
        <span className="text-sm text-gray-500">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
      </div>
      <ul className="flex-1 max-h-40 overflow-y-auto mb-2">
        {cart.length === 0 ? (
          <li className="text-gray-400 text-sm">Your cart is empty.</li>
        ) : (
          cart.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 py-1 border-b last:border-b-0">
              <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
              <span className="flex-1 text-sm">{item.name} ({item.weight})</span>
              <span className="font-semibold text-green-700 text-sm">Ksh {item.prices[item.weight]}</span>
            </li>
          ))
        )}
      </ul>
      <div className="flex items-center justify-between font-bold text-base">
        <span>Total:</span>
        <span className="text-green-700">Ksh {total}</span>
      </div>
      <button
        className="w-full py-2 mt-2 rounded bg-green-600 text-white font-semibold disabled:bg-gray-300"
        onClick={onCheckout}
        disabled={cart.length === 0}
      >
        Checkout
      </button>
    </div>
  );
} 