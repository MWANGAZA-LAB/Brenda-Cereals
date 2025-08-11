'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ProductCard from "./ProductCard";
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../utils/api';
export default function ProductGridClient() {
    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });
    if (isLoading) {
        return (_jsxs("div", { className: "py-8 text-center", children: [_jsx("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Loading products..." })] }));
    }
    if (error) {
        return (_jsx("div", { className: "py-8 text-center text-red-600", children: _jsx("p", { children: "Failed to load products. Please try again later." }) }));
    }
    return (_jsxs("section", { className: "max-w-7xl mx-auto py-12 px-4", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800 mb-2", children: "Our Premium Cereals" }), _jsx("p", { className: "text-gray-600", children: "Fresh, high-quality cereals sourced directly from Kenyan farmers" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8", children: products && products.map((product) => (_jsx(ProductCard, { product: product }, product.id))) }), products && products.length === 0 && (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500 text-lg", children: "No products available at the moment." }) }))] }));
}
