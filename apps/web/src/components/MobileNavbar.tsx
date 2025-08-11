'use client';
import { useState } from "react";
import Link from "next/link";
import { FaBars, FaShoppingCart, FaGlobe, FaHome, FaBox, FaCreditCard, FaCog } from "react-icons/fa";

export default function MobileNavbar({ cartCount = 0, onLangSwitch = () => {} }) {
  const [open, setOpen] = useState(false);
  
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50 flex md:hidden justify-between items-center px-4 py-3">
      {/* Menu Button */}
      <button 
        onClick={() => setOpen(!open)} 
        className="flex flex-col items-center space-y-1 text-gray-600 hover:text-green-600 transition-colors active:scale-95"
      >
        <FaBars className="text-xl" />
        <span className="text-xs">Menu</span>
      </button>
      
      {/* Brand */}
      <div className="flex flex-col items-center">
        <span className="font-bold text-lg text-green-600">Brenda Cereals</span>
        <span className="text-xs text-gray-500">Fresh & Quality</span>
      </div>
      
      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Cart */}
        <button className="relative flex flex-col items-center space-y-1 text-gray-600 hover:text-green-600 transition-colors active:scale-95">
          <FaShoppingCart className="text-xl" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
          <span className="text-xs">Cart</span>
        </button>
        
        {/* Language Switch */}
        <button 
          onClick={onLangSwitch} 
          className="flex flex-col items-center space-y-1 text-gray-600 hover:text-green-600 transition-colors active:scale-95"
        >
          <FaGlobe className="text-xl" />
          <span className="text-xs">Lang</span>
        </button>
      </div>
      
      {/* Mobile Menu Drawer */}
      {open && (
        <div className="absolute bottom-16 left-2 right-2 bg-white rounded-lg shadow-xl border p-4 max-h-80 overflow-y-auto">
          <div className="mb-4 pb-2 border-b border-gray-200">
            <div className="font-semibold text-lg text-gray-800">Quick Menu</div>
            <div className="text-sm text-gray-500">Navigate quickly</div>
          </div>
          
          <ul className="space-y-3">
            <li>
              <Link href="/" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <FaHome className="text-green-600" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/products" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <FaBox className="text-green-600" />
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <FaCreditCard className="text-green-600" />
                <span>Checkout</span>
              </Link>
            </li>
            <li>
              <Link href="/admin" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <FaCog className="text-green-600" />
                <span>Admin</span>
              </Link>
            </li>
          </ul>
          
          {/* Close Button */}
          <button 
            onClick={() => setOpen(false)}
            className="w-full mt-4 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
          >
            Close
          </button>
        </div>
      )}
    </nav>
  );
} 