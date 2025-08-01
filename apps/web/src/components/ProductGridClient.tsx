'use client';
import ProductCard, { Product } from "./ProductCard";
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../utils/api';

export default function ProductGridClient() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="mt-2 text-gray-600">Loading products...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8 text-center text-red-600">
        <p>Failed to load products. Please try again later.</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Our Premium Cereals</h2>
        <p className="text-gray-600">Fresh, high-quality cereals sourced directly from Kenyan farmers</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products && products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {products && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available at the moment.</p>
        </div>
      )}
    </section>
  );
} 