'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export default function StickyCartPanel() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  if (cart.itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      {/* Collapsed View */}
      <div 
        className="px-4 py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {cart.itemCount}
            </div>
            <span className="font-semibold text-gray-800">
              {cart.itemCount} item{cart.itemCount > 1 ? 's' : ''} in cart
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold text-green-600">
              KSh {cart.total.toLocaleString()}
            </span>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to checkout
                window.location.href = '/checkout';
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-gray-100 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-3">
            {cart.items.map((item) => (
              <div key={`${item.id}-${item.weight}`} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                <div className="w-12 h-12 relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded"
                  />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-800">{item.name}</h4>
                  <p className="text-xs text-gray-600">{item.weight}</p>
                  <p className="text-sm font-semibold text-green-600">
                    KSh {item.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id, item.weight)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}