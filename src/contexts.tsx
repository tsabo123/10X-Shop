import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { StorageService } from './services/storage';
import type { CartState, Order, Product, User } from './types';

type AuthValue = { user: User | null; login: (name: string, email: string) => void; logout: () => void; updateProfile: (name: string) => void };
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => StorageService.get<User | null>('shop_user', null));
  const login = (name: string, email: string) => { const next = { id: Date.now(), name, email, joinedAt: new Date().toISOString() }; setUser(next); StorageService.set('shop_user', next); };
  const logout = () => { setUser(null); StorageService.remove('shop_user'); };
  const updateProfile = (name: string) => { if (!user) return; const next = { ...user, name }; setUser(next); StorageService.set('shop_user', next); };
  return <AuthContext.Provider value={{ user, login, logout, updateProfile }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider.'); return value; }

type CartAction = { type: 'add'; product: Product } | { type: 'quantity'; id: number; quantity: number } | { type: 'remove'; id: number } | { type: 'promo'; code: string | null } | { type: 'clear' };
function cartReducer(state: CartState, action: CartAction): CartState {
  if (action.type === 'add') { if (action.product.stock < 1) return state; const found = state.items.find(item => item.product.id === action.product.id); return { ...state, items: found ? state.items.map(item => item.product.id === action.product.id ? { ...item, quantity: Math.min(item.quantity + 1, action.product.stock) } : item) : [...state.items, { product: action.product, quantity: 1 }] }; }
  if (action.type === 'quantity') return { ...state, items: state.items.map(item => item.product.id === action.id ? { ...item, quantity: Math.max(1, Math.min(action.quantity, item.product.stock)) } : item) };
  if (action.type === 'remove') return { ...state, items: state.items.filter(item => item.product.id !== action.id) };
  if (action.type === 'promo') return { ...state, promoCode: action.code };
  return { items: [], promoCode: null };
}
type CartValue = { state: CartState; count: number; subtotal: number; total: number; add: (product: Product) => void; setQuantity: (id: number, quantity: number) => void; remove: (id: number) => void; applyPromo: (code: string) => boolean; clear: () => void };
const CartContext = createContext<CartValue | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, StorageService.get<CartState>('shop_cart', { items: [], promoCode: null }));
  useEffect(() => StorageService.set('shop_cart', state), [state]);
  const subtotal = state.items.reduce((sum, item) => sum + item.product.price * (1 - item.product.discountPercentage / 100) * item.quantity, 0);
  const total = subtotal * (state.promoCode === '10X10' ? 0.9 : 1);
  const value = useMemo(() => ({ state, count: state.items.reduce((sum, item) => sum + item.quantity, 0), subtotal, total,
    add: (product: Product) => dispatch({ type: 'add', product }), setQuantity: (id: number, quantity: number) => dispatch({ type: 'quantity', id, quantity }), remove: (id: number) => dispatch({ type: 'remove', id }),
    applyPromo: (code: string) => { if (code.trim().toUpperCase() !== '10X10') return false; dispatch({ type: 'promo', code: '10X10' }); return true; }, clear: () => dispatch({ type: 'clear' }) }), [state, subtotal, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('useCart must be used inside CartProvider.'); return value; }

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => StorageService.get<Theme>('shop_theme', 'light'));
  useEffect(() => { document.documentElement.dataset.theme = theme; StorageService.set('shop_theme', theme); }, [theme]);
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme(current => current === 'light' ? 'dark' : 'light') }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const value = useContext(ThemeContext); if (!value) throw new Error('useTheme must be used inside ThemeProvider.'); return value; }

export function loadOrders(): Order[] { return StorageService.get<Order[]>('shop_orders', []); }
export function saveOrder(order: Order): void { StorageService.set('shop_orders', [order, ...loadOrders()]); }
