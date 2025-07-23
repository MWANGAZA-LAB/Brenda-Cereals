'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Product = {
  id: string;
  name: string;
  image: string;
  prices: { [weight: string]: number };
  inStock: boolean;
};

type CartItem = Product & { weight: string };

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, weight: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  function addToCart(product: Product, weight: string) {
    setCart((prev) => [...prev, { ...product, weight }]);
  }
  function clearCart() {
    setCart([]);
  }
  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
} 