'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, MenuItem, CartContextType } from '@/types';

type CartAction =
  | { type: 'ADD_ITEM'; item: MenuItem; quantity?: number }
  | { type: 'REMOVE_ITEM'; menuItemId: string }
  | { type: 'UPDATE_QUANTITY'; menuItemId: string; quantity: number }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.findIndex(
        item => item.menuItem.id === action.item.id
      );
      
      if (existingItemIndex > -1) {
        const updatedState = [...state];
        updatedState[existingItemIndex] = {
          ...updatedState[existingItemIndex],
          quantity: updatedState[existingItemIndex].quantity + (action.quantity || 1)
        };
        return updatedState;
      } else {
        return [...state, { menuItem: action.item, quantity: action.quantity || 1 }];
      }
    }
    
    case 'REMOVE_ITEM':
      return state.filter(item => item.menuItem.id !== action.menuItemId);
    
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return state.filter(item => item.menuItem.id !== action.menuItemId);
      }
      
      return state.map(item =>
        item.menuItem.id === action.menuItemId
          ? { ...item, quantity: action.quantity }
          : item
      );
    }
    
    case 'CLEAR_CART':
      return [];
    
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  const addItem = (item: MenuItem, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', item, quantity });
  };

  const removeItem = (menuItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', menuItemId });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', menuItemId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}