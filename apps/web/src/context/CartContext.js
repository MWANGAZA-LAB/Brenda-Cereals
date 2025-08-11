'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useEffect } from 'react';
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id && item.weight === action.payload.weight);
            let newItems;
            if (existingItemIndex > -1) {
                newItems = state.items.map((item, index) => index === existingItemIndex
                    ? { ...item, quantity: item.quantity + action.payload.quantity }
                    : item);
            }
            else {
                newItems = [...state.items, action.payload];
            }
            const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
            return { items: newItems, total, itemCount };
        }
        case 'REMOVE_ITEM': {
            const newItems = state.items.filter(item => !(item.id === action.payload.id && item.weight === action.payload.weight));
            const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
            return { items: newItems, total, itemCount };
        }
        case 'UPDATE_QUANTITY': {
            if (action.payload.quantity <= 0) {
                return cartReducer(state, {
                    type: 'REMOVE_ITEM',
                    payload: { id: action.payload.id, weight: action.payload.weight }
                });
            }
            const newItems = state.items.map(item => item.id === action.payload.id && item.weight === action.payload.weight
                ? { ...item, quantity: action.payload.quantity }
                : item);
            const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
            return { items: newItems, total, itemCount };
        }
        case 'CLEAR_CART':
            return { items: [], total: 0, itemCount: 0 };
        case 'LOAD_CART': {
            const total = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0);
            return { items: action.payload, total, itemCount };
        }
        default:
            return state;
    }
};
const CartContext = createContext(null);
const CART_STORAGE_KEY = 'brenda-cereals-cart';
export function CartProvider({ children }) {
    const [cart, dispatch] = useReducer(cartReducer, {
        items: [],
        total: 0,
        itemCount: 0,
    });
    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                dispatch({ type: 'LOAD_CART', payload: parsedCart });
            }
        }
        catch (error) {
            console.error('Error loading cart from localStorage:', error);
        }
    }, []);
    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
        }
        catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cart.items]);
    const addToCart = (item) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    };
    const removeFromCart = (id, weight) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id, weight } });
    };
    const updateQuantity = (id, weight, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, weight, quantity } });
    };
    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };
    return (_jsx(CartContext.Provider, { value: {
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
        }, children: children }));
}
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
