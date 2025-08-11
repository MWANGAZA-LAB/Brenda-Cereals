'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../utils/api';
const weights = ['1kg', '5kg', '50kg'];
export default function AdminPage() {
    const queryClient = useQueryClient();
    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ id: '', name: '', image: '', prices: { '1kg': '', '5kg': '', '50kg': '' }, inStock: true });
    const addProductMutation = useMutation({
        mutationFn: addProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    });
    const updateProductMutation = useMutation({
        mutationFn: ({ id, product }) => updateProduct(id, product),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    });
    const deleteProductMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    });
    function handleEdit(product) {
        setEditing(product.id);
        setForm({ ...product, prices: { '1kg': String(product.prices['1kg']), '5kg': String(product.prices['5kg']), '50kg': String(product.prices['50kg']) } });
    }
    function handleDelete(id) {
        deleteProductMutation.mutate(id);
    }
    function handleChange(e) {
        const { name, value, type } = e.target;
        let checked = false;
        if (type === 'checkbox' && 'checked' in e.target) {
            checked = e.target.checked;
        }
        if (weights.includes(name)) {
            setForm(f => ({ ...f, prices: { ...f.prices, [name]: value } }));
        }
        else if (type === 'checkbox') {
            setForm(f => ({ ...f, [name]: checked }));
        }
        else {
            setForm(f => ({ ...f, [name]: value }));
        }
    }
    function handleSubmit(e) {
        e.preventDefault();
        const product = {
            id: editing ? form.id : form.name.toLowerCase().replace(/\s+/g, '-'),
            name: form.name,
            description: `Premium quality ${form.name.toLowerCase()} sourced from local farmers`,
            image: form.image,
            category: 'cereals',
            prices: {
                '1kg': Number(form.prices['1kg']),
                '5kg': Number(form.prices['5kg']),
                '50kg': Number(form.prices['50kg']),
            },
            stock: 100, // Default stock value
            inStock: form.inStock,
        };
        if (editing) {
            updateProductMutation.mutate({ id: editing, product });
        }
        else {
            addProductMutation.mutate(product);
        }
        setEditing(null);
        setForm({ id: '', name: '', image: '', prices: { '1kg': '', '5kg': '', '50kg': '' }, inStock: true });
    }
    function handleCancel() {
        setEditing(null);
        setForm({ id: '', name: '', image: '', prices: { '1kg': '', '5kg': '', '50kg': '' }, inStock: true });
    }
    if (isLoading)
        return _jsx("div", { className: "py-8 text-center", children: "Loading products..." });
    if (error)
        return _jsx("div", { className: "py-8 text-center text-red-600", children: "Failed to load products." });
    return (_jsxs("div", { className: "max-w-4xl mx-auto py-8 px-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Admin Dashboard" }), _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "font-semibold mb-2", children: "Products" }), _jsxs("table", { className: "w-full border mb-4", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100", children: [_jsx("th", { className: "p-2", children: "Name" }), _jsx("th", { className: "p-2", children: "Image" }), _jsx("th", { className: "p-2", children: "Prices" }), _jsx("th", { className: "p-2", children: "Stock" }), _jsx("th", { className: "p-2", children: "Actions" })] }) }), _jsx("tbody", { children: products && products.map(p => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-2", children: p.name }), _jsx("td", { className: "p-2", children: _jsx("img", { src: p.image, alt: p.name, className: "w-12 h-12 object-cover rounded" }) }), _jsx("td", { className: "p-2", children: weights.map(w => (_jsxs("div", { children: [w, ": ", _jsxs("span", { className: "font-semibold", children: ["Ksh ", p.prices[w]] })] }, w))) }), _jsx("td", { className: "p-2", children: p.inStock ? 'In Stock' : 'Out of Stock' }), _jsxs("td", { className: "p-2", children: [_jsx("button", { className: "text-blue-600 mr-2", onClick: () => handleEdit(p), children: "Edit" }), _jsx("button", { className: "text-red-600", onClick: () => handleDelete(p.id), children: "Delete" })] })] }, p.id))) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "bg-gray-50 p-4 rounded shadow mb-4", children: [_jsx("h3", { className: "font-semibold mb-2", children: editing ? 'Edit Product' : 'Add Product' }), _jsxs("div", { className: "mb-2", children: [_jsx("label", { className: "block mb-1", children: "Name" }), _jsx("input", { name: "name", value: form.name, onChange: handleChange, className: "w-full border rounded px-2 py-1", required: true })] }), _jsxs("div", { className: "mb-2", children: [_jsx("label", { className: "block mb-1", children: "Image URL (placeholder for upload)" }), _jsx("input", { name: "image", value: form.image, onChange: handleChange, className: "w-full border rounded px-2 py-1", required: true })] }), _jsx("div", { className: "mb-2 grid grid-cols-3 gap-2", children: weights.map(w => (_jsxs("div", { children: [_jsxs("label", { className: "block mb-1", children: [w, " Price"] }), _jsx("input", { name: w, value: form.prices[w], onChange: handleChange, className: "w-full border rounded px-2 py-1", required: true, type: "number", min: "0" })] }, w))) }), _jsx("div", { className: "mb-2", children: _jsxs("label", { className: "inline-flex items-center", children: [_jsx("input", { type: "checkbox", name: "inStock", checked: form.inStock, onChange: handleChange, className: "mr-2" }), "In Stock"] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", className: "bg-green-600 text-white px-4 py-2 rounded font-semibold", children: editing ? 'Update' : 'Add' }), editing && _jsx("button", { type: "button", className: "bg-gray-300 px-4 py-2 rounded", onClick: handleCancel, children: "Cancel" })] })] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "font-semibold mb-2", children: "Orders" }), _jsx("div", { className: "bg-gray-50 p-4 rounded shadow text-gray-500", children: "Order management coming soon..." })] }), _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded font-semibold", children: "Export Sales (CSV)" })] }));
}
