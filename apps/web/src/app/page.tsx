import Image from "next/image";
import styles from "./page.module.css";
import { useTranslation } from "next-i18next";
import ProductGridClient from "../components/ProductGridClient";
import LocationEstimator from "../components/LocationEstimator";
import MobileNavbar from "../components/MobileNavbar";
import { useState } from "react";
import type { Product } from "../components/ProductCard";
import type { CartItem } from "../components/ProductGridClient";

const categories = [
  { name: "Maize", icon: "/maize.png" },
  { name: "Beans", icon: "/beans.png" },
  { name: "Rice", icon: "/rice.png" },
  { name: "Millet", icon: "/millet.png" },
  { name: "Sorghum", icon: "/sorghum.png" },
];

const sampleProducts = [
  {
    id: "maize",
    name: "Maize (White)",
    image: "/maize-product.jpg",
    prices: { "1kg": 120, "5kg": 550, "50kg": 5000 },
    inStock: true,
  },
  {
    id: "beans",
    name: "Beans (Rosecoco)",
    image: "/beans-product.jpg",
    prices: { "1kg": 180, "5kg": 850, "50kg": 8000 },
    inStock: true,
  },
  {
    id: "rice",
    name: "Rice (Pishori)",
    image: "/rice-product.jpg",
    prices: { "1kg": 250, "5kg": 1200, "50kg": 11000 },
    inStock: false,
  },
  // Add more products as needed
];

export default function Home() {
  const { t } = useTranslation('common');
  const [cart, setCart] = useState<CartItem[]>([]);

  function handleAddToCart(product: Product, weight: string) {
    setCart((prev: CartItem[]) => [...prev, { ...product, weight }]);
  }

  function handleLangSwitch() {
    alert('Language switch coming soon!');
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Hero Section */}
      <section className="relative w-full h-64 md:h-96 flex items-center justify-center bg-gray-100 overflow-hidden">
        <Image
          src="/hero-farmer.jpg"
          alt="Farmer with cereals"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
            Brenda Cereals
          </h1>
          <p className="text-lg md:text-2xl text-white mb-4">
            {t('greeting')}
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
      <ProductGridClient cart={cart} onAddToCart={handleAddToCart} />

      {/* Mobile Navbar */}
      <MobileNavbar cartCount={cart.length} onLangSwitch={handleLangSwitch} />

      {/* ...rest of homepage... */}
    </div>
  );
}
