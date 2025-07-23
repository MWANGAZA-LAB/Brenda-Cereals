'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../utils/api';
import type { Product } from '../../components/ProductCard';

const weights = ['1kg', '5kg', '50kg'];

type ProductForm = {
  id: string;
  name: string;
  image: string;
  prices: { [key: string]: string; '1kg': string; '5kg': string; '50kg': string };
  inStock: boolean;
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({ id: '', name: '', image: '', prices: { '1kg': '', '5kg': '', '50kg': '' }, inStock: true });

  const addProductMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
  const updateProductMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: Product }) => updateProduct(id, product),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  function handleEdit(product: Product) {
    setEditing(product.id);
    setForm({ ...product, prices: { '1kg': String(product.prices['1kg']), '5kg': String(product.prices['5kg']), '50kg': String(product.prices['50kg']) } });
  }
  function handleDelete(id: string) {
    deleteProductMutation.mutate(id);
  }
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === 'checkbox' && 'checked' in e.target) {
      checked = (e.target as HTMLInputElement).checked;
    }
    if (weights.includes(name)) {
      setForm(f => ({ ...f, prices: { ...f.prices, [name]: value } }));
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const product: Product = {
      id: editing ? form.id : form.name.toLowerCase().replace(/\s+/g, '-'),
      name: form.name,
      image: form.image,
      prices: {
        '1kg': Number(form.prices['1kg']),
        '5kg': Number(form.prices['5kg']),
        '50kg': Number(form.prices['50kg']),
      },
      inStock: form.inStock,
    };
    if (editing) {
      updateProductMutation.mutate({ id: editing, product });
    } else {
      addProductMutation.mutate(product);
    }
    setEditing(null);
    setForm({ id: '', name: '', image: '', prices: { '1kg': '', '5kg': '', '50kg': '' }, inStock: true });
  }
  function handleCancel() {
    setEditing(null);
    setForm({ id: '', name: '', image: '', prices: { '1kg': '', '5kg': '', '50kg': '' }, inStock: true });
  }

  if (isLoading) return <div className="py-8 text-center">Loading products...</div>;
  if (error) return <div className="py-8 text-center text-red-600">Failed to load products.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {/* Product Management */}
      <div className="mb-8">
        <h2 className="font-semibold mb-2">Products</h2>
        <table className="w-full border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Name</th>
              <th className="p-2">Image</th>
              <th className="p-2">Prices</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products && products.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2"><img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" /></td>
                <td className="p-2">
                  {weights.map(w => (
                    <div key={w}>{w}: <span className="font-semibold">Ksh {p.prices[w]}</span></div>
                  ))}
                </td>
                <td className="p-2">{p.inStock ? 'In Stock' : 'Out of Stock'}</td>
                <td className="p-2">
                  <button className="text-blue-600 mr-2" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="text-red-600" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded shadow mb-4">
          <h3 className="font-semibold mb-2">{editing ? 'Edit Product' : 'Add Product'}</h3>
          <div className="mb-2">
            <label className="block mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Image URL (placeholder for upload)</label>
            <input name="image" value={form.image} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div className="mb-2 grid grid-cols-3 gap-2">
            {weights.map(w => (
              <div key={w}>
                <label className="block mb-1">{w} Price</label>
                <input name={w} value={form.prices[w]} onChange={handleChange} className="w-full border rounded px-2 py-1" required type="number" min="0" />
              </div>
            ))}
          </div>
          <div className="mb-2">
            <label className="inline-flex items-center">
              <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} className="mr-2" />
              In Stock
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-semibold">{editing ? 'Update' : 'Add'}</button>
            {editing && <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={handleCancel}>Cancel</button>}
          </div>
        </form>
      </div>
      {/* Orders Table Placeholder */}
      <div className="mb-8">
        <h2 className="font-semibold mb-2">Orders</h2>
        <div className="bg-gray-50 p-4 rounded shadow text-gray-500">Order management coming soon...</div>
      </div>
      {/* Export Sales Placeholder */}
      <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">Export Sales (CSV)</button>
    </div>
  );
} 