import Image from "next/image";
import { useState } from "react";

export type Product = {
  id: string;
  name: string;
  image: string;
  prices: { [weight: string]: number };
  inStock: boolean;
};

type Props = {
  product: Product;
  onAddToCart: (product: Product, weight: string) => void;
};

const weights = ["1kg", "5kg", "50kg"];

export default function ProductCard({ product, onAddToCart }: Props) {
  const [selectedWeight, setSelectedWeight] = useState("1kg");
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center w-full max-w-xs">
      <div className="w-full h-40 relative mb-2">
        <Image
          src={product.image}
          alt={product.name}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded"
        />
      </div>
      <h2 className="text-lg font-semibold mb-1 text-center">{product.name}</h2>
      <div className="flex gap-2 mb-2">
        {weights.map((w) => (
          <button
            key={w}
            className={`px-2 py-1 rounded border text-xs font-medium ${selectedWeight === w ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setSelectedWeight(w)}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="mb-2 text-base font-bold text-green-700">
        Ksh {product.prices[selectedWeight] || "-"}
      </div>
      <button
        className="w-full py-2 rounded bg-green-600 text-white font-semibold disabled:bg-gray-300"
        onClick={() => onAddToCart(product, selectedWeight)}
        disabled={!product.inStock}
      >
        {product.inStock ? "Add to Cart" : "Out of Stock"}
      </button>
    </div>
  );
} 