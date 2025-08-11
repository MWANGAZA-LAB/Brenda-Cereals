import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Image from "next/image";
import { useState } from "react";
import { useCart } from '@/context/CartContext';
export default function ProductCard({ product }) {
    const [selectedWeight, setSelectedWeight] = useState(() => {
        const weights = Object.keys(product.prices);
        return weights[0] || '1kg';
    });
    const { addToCart } = useCart();
    const handleAddToCart = () => {
        const price = product.prices[selectedWeight];
        if (price) {
            addToCart({
                id: product.id,
                name: product.name,
                image: product.image,
                weight: selectedWeight,
                quantity: 1,
                price: price,
            });
        }
    };
    const availableWeights = Object.keys(product.prices);
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 flex flex-col h-full transition-transform hover:scale-105", children: [_jsx("div", { className: "w-full h-48 relative mb-4", children: _jsx(Image, { src: product.image, alt: product.name, fill: true, style: { objectFit: 'cover' }, className: "rounded-lg" }) }), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx("h3", { className: "font-semibold text-lg mb-2 text-gray-800", children: product.name }), _jsx("p", { className: "text-gray-600 text-sm mb-4 flex-1", children: product.description }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Select Weight:" }), _jsx("select", { value: selectedWeight, onChange: (e) => setSelectedWeight(e.target.value), className: "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500", children: availableWeights.map((weight) => (_jsx("option", { value: weight, children: weight }, weight))) })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("span", { className: "text-2xl font-bold text-green-600", children: ["KSh ", product.prices[selectedWeight]?.toLocaleString()] }), _jsxs("span", { className: "text-sm text-gray-500", children: ["Stock: ", product.stock] })] }), _jsx("button", { onClick: handleAddToCart, disabled: !product.inStock, className: `w-full py-2 px-4 rounded-md font-medium transition-colors ${product.inStock
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`, children: product.inStock ? 'Add to Cart' : 'Out of Stock' })] })] }));
}
