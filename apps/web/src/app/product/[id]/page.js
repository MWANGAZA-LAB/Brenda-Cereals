"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProductPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const image_1 = __importDefault(require("next/image"));
const react_1 = require("react");
const navigation_1 = require("next/navigation");
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
function ProductPage({ params }) {
    const { id } = (0, react_1.use)(params);
    const router = (0, navigation_1.useRouter)();
    const product = sampleProducts.find((p) => p.id === id);
    const [selectedWeight, setSelectedWeight] = (0, react_1.useState)("1kg");
    const [imgIdx, setImgIdx] = (0, react_1.useState)(0);
    if (!product) {
        return (0, jsx_runtime_1.jsx)("div", { className: "p-8 text-center", children: "Product not found." });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-3xl mx-auto py-8 px-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative w-full h-64 mb-4", children: [(0, jsx_runtime_1.jsx)(image_1.default, { src: product.images[imgIdx], alt: product.name, fill: true, style: { objectFit: 'cover' }, className: "rounded" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2", children: product.images.map((img, idx) => ((0, jsx_runtime_1.jsx)("button", { className: `w-3 h-3 rounded-full ${imgIdx === idx ? "bg-green-600" : "bg-gray-300"}`, onClick: () => setImgIdx(idx) }, img))) })] }), (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold mb-2", children: product.name }), (0, jsx_runtime_1.jsx)("p", { className: "mb-2 text-gray-700", children: product.description }), (0, jsx_runtime_1.jsx)("div", { className: "mb-2 text-sm text-gray-500", children: product.nutrition }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 mb-2", children: weights.map((w) => ((0, jsx_runtime_1.jsx)("button", { className: `px-2 py-1 rounded border text-xs font-medium ${selectedWeight === w ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`, onClick: () => setSelectedWeight(w), children: w }, w))) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 mb-4", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-lg font-bold text-green-700", children: ["Ksh ", product.prices[selectedWeight]] }), (0, jsx_runtime_1.jsx)("button", { className: "px-4 py-2 rounded bg-green-600 text-white font-semibold disabled:bg-gray-300", disabled: !product.inStock, onClick: () => alert('Added to cart!'), children: product.inStock ? "Add to Cart" : "Out of Stock" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-600 mb-2", children: ["Estimated delivery: Ksh ", product.delivery] }), (0, jsx_runtime_1.jsx)("button", { className: "text-blue-600 underline text-sm", onClick: () => router.back(), children: "\u2190 Back to products" })] }));
}
