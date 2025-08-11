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
      {/* Collapsed View - Mobile Optimized */}
      <div 
        className="px-4 py-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 text-white rounded-full w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-sm font-bold">
              {cart.itemCount}
            </div>
            <span className="font-semibold text-gray-800 text-sm sm:text-base">
              {cart.itemCount} item{cart.itemCount > 1 ? 's' : ''} in cart
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-lg sm:text-xl font-bold text-green-600 text-center sm:text-right">
              KSh {cart.total.toLocaleString()}
            </span>
            <button 
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 sm:py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95"
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

      {/* Expanded View - Mobile Optimized */}
      {isExpanded && (
        <div className="border-t border-gray-100 max-h-80 sm:max-h-96 overflow-y-auto">
          <div className="p-4 space-y-3">
            {cart.items.map((item) => (
              <div key={`${item.id}-${item.weight}`} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                {/* Product Image - Mobile Optimized */}
                <div className="w-16 h-16 sm:w-12 sm:h-12 relative flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded"
                  />
                </div>
                
                {/* Product Details - Mobile Optimized */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-800 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-600">{item.weight}</p>
                  <p className="text-sm font-semibold text-green-600">
                    KSh {item.price.toLocaleString()}
                  </p>
                </div>

                {/* Quantity Controls - Touch Friendly */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 active:scale-95 transition-all duration-200"
                  >
                    -
                  </button>
                  <span className="w-10 sm:w-8 text-center font-medium text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700 active:scale-95 transition-all duration-200"
                  >
                    +
                  </button>
                </div>

                {/* Remove Button - Touch Friendly */}
                <button
                  onClick={() => removeFromCart(item.id, item.weight)}
                  className="text-red-500 hover:text-red-700 p-2 active:scale-95 transition-all duration-200"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}