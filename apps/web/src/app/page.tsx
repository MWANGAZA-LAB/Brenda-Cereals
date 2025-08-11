'use client';
import Image from "next/image";
import ProductGridClient from "../components/ProductGridClient";
import LocationEstimator from "../components/LocationEstimator";
import MobileNavbar from "../components/MobileNavbar";
import StickyCartPanel from "../components/StickyCartPanel";
import Header from "../components/Header";
import { CartProvider, useCart } from "../context/CartContext";

const categories = [
  { name: "Maize", icon: "/maize.png" },
  { name: "Beans", icon: "/beans.png" },
  { name: "Rice", icon: "/rice.png" },
  { name: "Millet", icon: "/millet.png" },
  { name: "Sorghum", icon: "/sorghum.png" },
];

function HomeContent() {
  const { cart } = useCart();

  function handleLangSwitch() {
    alert('Language switch coming soon!');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <Header />
      
      {/* Hero Section - Enhanced Mobile Responsiveness */}
      <section className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center bg-gray-100 overflow-hidden">
        <Image
          src="/hero-farmer.jpg"
          alt="Farmer with cereals"
          fill
          style={{ objectFit: 'cover' }}
          className="z-0"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10 flex flex-col items-center justify-center text-center px-4">
          <h1 className="mobile-heading font-bold text-white drop-shadow-lg mb-2 leading-tight">
            Brenda Cereals
          </h1>
          <p className="mobile-text text-white mb-4 max-w-md">
            Your trusted source for wholesome Kenyan grains
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            <span className="bg-green-600 text-white px-3 py-2 rounded-full text-xs sm:text-sm font-semibold">Fresh Stock</span>
            <span className="bg-yellow-500 text-white px-3 py-2 rounded-full text-xs sm:text-sm font-semibold">Best Prices</span>
          </div>
          <div className="flex gap-3 sm:gap-4 justify-center mt-2">
            <Image src="/mpesa-logo.png" alt="M-Pesa" width={48} height={24} className="h-6 w-auto" />
            <Image src="/bitcoin-logo.png" alt="Bitcoin" width={32} height={32} className="h-8 w-8" />
          </div>
        </div>
      </section>

      {/* Categories Strip - Enhanced Mobile Scrolling */}
      <nav className="w-full bg-white shadow-sm py-3 px-4 flex gap-4 overflow-x-auto border-b border-gray-100 scrollbar-hide">
        {categories.map((cat) => (
          <div key={cat.name} className="flex flex-col items-center min-w-[80px] sm:min-w-[64px]">
            <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-1">
              <Image src={cat.icon} alt={cat.name} width={32} height={32} className="w-8 h-8 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs sm:text-xs font-medium text-gray-700 text-center">{cat.name}</span>
          </div>
        ))}
      </nav>

      {/* Location Prompt & Cost Estimator */}
      <div className="mobile-container">
        <LocationEstimator />
      </div>

      {/* Product Grid */}
      <div className="mobile-container">
        <ProductGridClient />
      </div>

      {/* Mobile Navbar */}
      <MobileNavbar cartCount={cart.itemCount} onLangSwitch={handleLangSwitch} />

      {/* Sticky Cart Panel */}
      <StickyCartPanel />
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  );
}
