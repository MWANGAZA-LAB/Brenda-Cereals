import Image from "next/image";
import { useState } from "react";
import { useCart } from '@/context/CartContext';

export type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  prices: { [weight: string]: number };
  stock: number;
  inStock: boolean;
};

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const [selectedWeight, setSelectedWeight] = useState<string>(() => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full transition-transform hover:scale-105">
      <div className="w-full h-48 relative mb-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-lg"
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-1">{product.description}</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Weight:
          </label>
          <select
            value={selectedWeight}
            onChange={(e) => setSelectedWeight(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {availableWeights.map((weight) => (
              <option key={weight} value={weight}>
                {weight}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-green-600">
            KSh {product.prices[selectedWeight]?.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">
            Stock: {product.stock}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            product.inStock
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}