import { StorageService, STORAGE_KEYS } from './storage';
import type { CartItem, CartState, Product } from '../types';

export type CartAction =
  | { type: 'ADD_ITEM'; product: Product; qty: number }
  | { type: 'ADD_LINE'; item: CartItem; qty: number }
  | { type: 'SET_QTY'; productId: number; qty: number }
  | { type: 'REMOVE_ITEM'; productId: number }
  | { type: 'CLEAR' }
  | { type: 'APPLY_PROMO'; code: string }
  | { type: 'REMOVE_PROMO' };

export const cartStorage = new StorageService<CartState>(STORAGE_KEYS.cart);

export function loadCart(): CartState {
  const saved = StorageService.get<unknown>(STORAGE_KEYS.cart, null);
  if (
    typeof saved !== 'object' ||
    saved === null ||
    !('items' in saved) ||
    !Array.isArray(saved.items)
  )
    return { items: [], promoCode: null };

  const items: CartItem[] = [];
  for (const value of saved.items) {
    if (typeof value !== 'object' || value === null) continue;
    const row = value as Record<string, unknown>;
    const oldProduct =
      typeof row.product === 'object' && row.product !== null
        ? (row.product as Record<string, unknown>)
        : null;
    const product = oldProduct ?? row;
    const productId =
      typeof row.productId === 'number' ? row.productId : product.id;
    if (
      typeof productId !== 'number' ||
      typeof product.title !== 'string' ||
      typeof product.thumbnail !== 'string' ||
      typeof product.price !== 'number' ||
      typeof product.discountPercentage !== 'number' ||
      typeof product.stock !== 'number'
    )
      continue;
    const quantity =
      typeof row.quantity === 'number'
        ? Math.max(1, Math.min(row.quantity, product.stock))
        : 1;
    items.push({
      productId,
      title: product.title,
      thumbnail: product.thumbnail,
      price: product.price,
      discountPercentage: product.discountPercentage,
      stock: product.stock,
      quantity
    });
  }
  return {
    items,
    promoCode:
      'promoCode' in saved && saved.promoCode === '10X10' ? '10X10' : null
  };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (
        action.product.stock < 1 ||
        action.qty < 1 ||
        action.qty > action.product.stock
      )
        return state;
      const item = state.items.find(
        (line) => line.productId === action.product.id
      );
      if (item && item.quantity + action.qty > action.product.stock)
        return state;
      const nextItem: CartItem = {
        productId: action.product.id,
        title: action.product.title,
        thumbnail: action.product.thumbnail,
        price: action.product.price,
        discountPercentage: action.product.discountPercentage,
        stock: action.product.stock,
        quantity: action.qty
      };
      return {
        ...state,
        items: item
          ? state.items.map((line) =>
              line.productId === action.product.id
                ? { ...line, quantity: line.quantity + action.qty }
                : line
            )
          : [...state.items, nextItem]
      };
    }
    case 'ADD_LINE': {
      const current = state.items.find(
        (line) => line.productId === action.item.productId
      );
      if (
        action.item.stock < 1 ||
        action.qty < 1 ||
        action.qty > action.item.stock ||
        (current && current.quantity + action.qty > action.item.stock)
      )
        return state;
      return {
        ...state,
        items: current
          ? state.items.map((line) =>
              line.productId === action.item.productId
                ? { ...line, quantity: line.quantity + action.qty }
                : line
            )
          : [...state.items, { ...action.item, quantity: action.qty }]
      };
    }
    case 'SET_QTY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.productId
            ? {
                ...item,
                quantity: Math.max(
                  1,
                  Math.min(Math.floor(action.qty), item.stock)
                )
              }
            : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.productId)
      };
    case 'CLEAR':
      return { items: [], promoCode: null };
    case 'APPLY_PROMO':
      return { ...state, promoCode: action.code };
    case 'REMOVE_PROMO':
      return { ...state, promoCode: null };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
