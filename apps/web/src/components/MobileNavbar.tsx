'use client';
import { useState } from "react";
import { FaBars, FaShoppingCart, FaGlobe } from "react-icons/fa";

export default function MobileNavbar({ cartCount = 0, onLangSwitch = () => {} }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow z-50 flex md:hidden justify-between items-center px-4 py-2">
      <button onClick={() => setOpen(!open)} className="text-2xl">
        <FaBars />
      </button>
      <span className="font-bold text-lg">Brenda Cereals</span>
      <div className="flex items-center gap-4">
        <button className="relative">
          <FaShoppingCart className="text-2xl" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full px-1">
              {cartCount}
            </span>
          )}
        </button>
        <button onClick={onLangSwitch} className="text-xl">
          <FaGlobe />
        </button>
      </div>
      {/* Hamburger menu drawer (placeholder) */}
      {open && (
        <div className="absolute bottom-12 left-2 right-2 bg-white rounded shadow p-4">
          <div className="mb-2 font-semibold">Menu</div>
          <ul className="space-y-2">
            <li><a href="#">Home</a></li>
            <li><a href="#">Products</a></li>
            <li><a href="#">Checkout</a></li>
            <li><a href="#">Admin</a></li>
          </ul>
        </div>
      )}
    </nav>
  );
} 