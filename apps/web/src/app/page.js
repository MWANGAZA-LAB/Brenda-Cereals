'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(Header, {}), _jsxs("section", { className: "relative w-full h-64 md:h-96 flex items-center justify-center bg-gray-100 overflow-hidden", children: [_jsx(Image, { src: "/hero-farmer.jpg", alt: "Farmer with cereals", fill: true, style: { objectFit: 'cover' }, className: "z-0" }), _jsxs("div", { className: "absolute inset-0 bg-black bg-opacity-30 z-10 flex flex-col items-center justify-center text-center", children: [_jsx("h1", { className: "text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2", children: "Brenda Cereals" }), _jsx("p", { className: "text-lg md:text-2xl text-white mb-4", children: "Your trusted source for wholesome Kenyan grains" }), _jsxs("div", { className: "flex gap-2 justify-center mb-2", children: [_jsx("span", { className: "bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold", children: "Fresh Stock" }), _jsx("span", { className: "bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold", children: "Best Prices" })] }), _jsxs("div", { className: "flex gap-4 justify-center mt-2", children: [_jsx(Image, { src: "/mpesa-logo.png", alt: "M-Pesa", width: 48, height: 24 }), _jsx(Image, { src: "/bitcoin-logo.png", alt: "Bitcoin", width: 32, height: 32 })] })] })] }), _jsx("nav", { className: "w-full bg-white shadow-sm py-2 px-2 flex gap-4 overflow-x-auto border-b border-gray-100", children: categories.map((cat) => (_jsxs("div", { className: "flex flex-col items-center min-w-[64px]", children: [_jsx("div", { className: "w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1", children: _jsx(Image, { src: cat.icon, alt: cat.name, width: 32, height: 32 }) }), _jsx("span", { className: "text-xs font-medium text-gray-700", children: cat.name })] }, cat.name))) }), _jsx(LocationEstimator, {}), _jsx(ProductGridClient, {}), _jsx(MobileNavbar, { cartCount: cart.itemCount, onLangSwitch: handleLangSwitch }), _jsx(StickyCartPanel, {})] }));
}
export default function Home() {
    return (_jsx(CartProvider, { children: _jsx(HomeContent, {}) }));
}
