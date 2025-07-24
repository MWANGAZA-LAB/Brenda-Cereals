// Shared types for Brenda Cereals application
export interface Product {
  id: string;
  name: string;
  image: string;
  prices: Record<string, number>;
  inStock: boolean;
}

export interface CartItem extends Product {
  weight: string;
  quantity?: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  deliveryLocation: string;
  deliveryFee: number;
  paymentMethod: 'mpesa' | 'bitcoin' | 'cash';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  weight: string;
  price: number;
  qty: number;
}

export interface Location {
  name: string;
  delivery: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type PaymentMethod = 'mpesa' | 'bitcoin' | 'cash';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type WeightOption = '1kg' | '5kg' | '50kg';

export interface ProductFormData {
  name: string;
  image: string;
  prices: Record<WeightOption, number>;
  inStock: boolean;
}
