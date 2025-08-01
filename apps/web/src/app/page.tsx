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
      
      {/* Hero Section */}
      <section className="relative w-full h-64 md:h-96 flex items-center justify-center bg-gray-100 overflow-hidden">
        <Image
          src="/hero-farmer.jpg"
          alt="Farmer with cereals"
          fill
          style={{ objectFit: 'cover' }}
          className="z-0"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
            Brenda Cereals
          </h1>
          <p className="text-lg md:text-2xl text-white mb-4">
            Your trusted source for wholesome Kenyan grains
          </p>
          <div className="flex gap-2 justify-center mb-2">
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Fresh Stock</span>
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Best Prices</span>
          </div>
          <div className="flex gap-4 justify-center mt-2">
            <Image src="/mpesa-logo.png" alt="M-Pesa" width={48} height={24} />
            <Image src="/bitcoin-logo.png" alt="Bitcoin" width={32} height={32} />
          </div>
        </div>
      </section>

      {/* Categories Strip */}
      <nav className="w-full bg-white shadow-sm py-2 px-2 flex gap-4 overflow-x-auto border-b border-gray-100">
        {categories.map((cat) => (
          <div key={cat.name} className="flex flex-col items-center min-w-[64px]">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
              <Image src={cat.icon} alt={cat.name} width={32} height={32} />
            </div>
            <span className="text-xs font-medium text-gray-700">{cat.name}</span>
          </div>
        ))}
      </nav>

      {/* Location Prompt & Cost Estimator */}
      <LocationEstimator />

      {/* Product Grid */}
      <ProductGridClient />

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
