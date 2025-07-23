'use client';
import ProductCard, { Product } from "./ProductCard";
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../utils/api';

export type CartItem = Product & { weight: string };

type Props = {
  cart: CartItem[];
  onAddToCart: (product: Product, weight: string) => void;
};

export default function ProductGridClient({ cart, onAddToCart }: Props) {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  if (isLoading) return <div className="py-8 text-center">Loading products...</div>;
  if (error) return <div className="py-8 text-center text-red-600">Failed to load products.</div>;

  return (
    <section className="max-w-6xl mx-auto py-8 px-4 relative">
      <h2 className="text-2xl font-bold mb-4">Our Cereals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products && products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
} 