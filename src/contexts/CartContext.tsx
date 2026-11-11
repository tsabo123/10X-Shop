import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode
} from 'react';
import { Cart } from '../models/Cart';
import { cartReducer, cartStorage, loadCart } from '../services/cartState';
import type { CartItem, CartState, Product } from '../types';

type CartValue = {
  state: CartState;
  count: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  add: (product: Product, qty?: number) => boolean;
  addLine: (item: CartItem, qty?: number) => boolean;
  setQuantity: (id: number, qty: number) => void;
  remove: (id: number) => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart);
  useEffect(() => cartStorage.write(state), [state]);

  const cart = useMemo(
    () => new Cart(state.items, state.promoCode ?? null),
    [state]
  );

  const value = useMemo(
    () => ({
      state,
      count: cart.itemCount,
      subtotal: cart.subtotal(),
      discount: cart.discount(),
      shipping: cart.shipping(),
      total: cart.total(),
      add: (product: Product, qty = 1) => {
        const line = state.items.find((item) => item.productId === product.id);
        if (
          product.stock < 1 ||
          qty < 1 ||
          qty > product.stock ||
          (line && line.quantity + qty > product.stock)
        )
          return false;
        dispatch({ type: 'ADD_ITEM', product, qty });
        return true;
      },
      addLine: (item: CartItem, qty = 1) => {
        const line = state.items.find(
          (current) => current.productId === item.productId
        );
        if (
          item.stock < 1 ||
          qty < 1 ||
          qty > item.stock ||
          (line && line.quantity + qty > item.stock)
        )
          return false;
        dispatch({ type: 'ADD_LINE', item, qty });
        return true;
      },
      setQuantity: (id: number, qty: number) =>
        dispatch({ type: 'SET_QTY', productId: id, qty }),
      remove: (id: number) =>
        dispatch({ type: 'REMOVE_ITEM', productId: id }),
      applyPromo: (code: string) => {
        if (code.trim().toUpperCase() !== '10X10') return false;
        dispatch({ type: 'APPLY_PROMO', code: '10X10' });
        return true;
      },
      removePromo: () => dispatch({ type: 'REMOVE_PROMO' }),
      clear: () => dispatch({ type: 'CLEAR' })
    }),
    [cart, state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider.');
  return value;
}
