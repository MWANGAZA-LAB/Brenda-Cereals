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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 sm:p-6 flex flex-col h-full">
      {/* Product Image - Enhanced Mobile */}
      <div className="w-full h-40 sm:h-48 relative mb-4 rounded-lg overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-lg hover:scale-105 transition-transform duration-200"
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Product Name - Mobile Optimized */}
        <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-800 line-clamp-2">{product.name}</h3>
        
        {/* Description - Mobile Optimized */}
        <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{product.description}</p>
        
        {/* Weight Selection - Enhanced Mobile */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Weight:
          </label>
          <select
            value={selectedWeight}
            onChange={(e) => setSelectedWeight(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {availableWeights.map((weight) => (
              <option key={weight} value={weight}>
                {weight}
              </option>
            ))}
          </select>
        </div>

        {/* Price and Stock - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <span className="text-xl sm:text-2xl font-bold text-green-600">
            KSh {product.prices[selectedWeight]?.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">
            Stock: {product.stock}
          </span>
        </div>

        {/* Add to Cart Button - Touch Friendly */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full py-3 sm:py-2 px-4 rounded-md font-medium transition-all duration-200 ${
            product.inStock
              ? 'btn-primary active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}