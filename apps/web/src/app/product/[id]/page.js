'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Image from "next/image";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
const sampleProducts = [
    {
        id: "maize",
        name: "Maize (White)",
        images: ["/maize-product.jpg", "/maize2.jpg"],
        description: "Premium white maize, perfect for ugali and porridge.",
        nutrition: "Rich in carbohydrates, gluten-free.",
        prices: { "1kg": 120, "5kg": 550, "50kg": 5000 },
        inStock: true,
        delivery: 300,
    },
    {
        id: "beans",
        name: "Beans (Rosecoco)",
        images: ["/beans-product.jpg", "/beans2.jpg"],
        description: "Nutritious Rosecoco beans, great for stews.",
        nutrition: "High in protein and fiber.",
        prices: { "1kg": 180, "5kg": 850, "50kg": 8000 },
        inStock: true,
        delivery: 250,
    },
    // Add more products as needed
];
const weights = ["1kg", "5kg", "50kg"];
export default function ProductPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const product = sampleProducts.find((p) => p.id === id);
    const [selectedWeight, setSelectedWeight] = useState("1kg");
    const [imgIdx, setImgIdx] = useState(0);
    if (!product) {
        return _jsx("div", { className: "p-8 text-center", children: "Product not found." });
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto py-8 px-4", children: [_jsxs("div", { className: "relative w-full h-64 mb-4", children: [_jsx(Image, { src: product.images[imgIdx], alt: product.name, fill: true, style: { objectFit: 'cover' }, className: "rounded" }), _jsx("div", { className: "absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2", children: product.images.map((img, idx) => (_jsx("button", { className: `w-3 h-3 rounded-full ${imgIdx === idx ? "bg-green-600" : "bg-gray-300"}`, onClick: () => setImgIdx(idx) }, img))) })] }), _jsx("h1", { className: "text-2xl font-bold mb-2", children: product.name }), _jsx("p", { className: "mb-2 text-gray-700", children: product.description }), _jsx("div", { className: "mb-2 text-sm text-gray-500", children: product.nutrition }), _jsx("div", { className: "flex gap-2 mb-2", children: weights.map((w) => (_jsx("button", { className: `px-2 py-1 rounded border text-xs font-medium ${selectedWeight === w ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`, onClick: () => setSelectedWeight(w), children: w }, w))) }), _jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsxs("span", { className: "text-lg font-bold text-green-700", children: ["Ksh ", product.prices[selectedWeight]] }), _jsx("button", { className: "px-4 py-2 rounded bg-green-600 text-white font-semibold disabled:bg-gray-300", disabled: !product.inStock, onClick: () => alert('Added to cart!'), children: product.inStock ? "Add to Cart" : "Out of Stock" })] }), _jsxs("div", { className: "text-sm text-gray-600 mb-2", children: ["Estimated delivery: Ksh ", product.delivery] }), _jsx("button", { className: "text-blue-600 underline text-sm", onClick: () => router.back(), children: "\u2190 Back to products" })] }));
}
