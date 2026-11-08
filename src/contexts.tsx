import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode
} from 'react';
import { Cart } from './models/Cart';
import { StorageService, STORAGE_KEYS } from './services/storage';
import type { CartItem, CartState, Order, Product, User } from './types';
export const DEMO_USERNAME = 'emilys';
export const DEMO_PASSWORD = 'emilyspass';
const AUTH_SESSION_VERSION = 1;
export type AuthResult =
  | 'success'
  | 'invalid-credentials'
  | 'username-taken'
  | 'email-taken'
  | 'account-not-found'
  | 'unavailable';
type SavedAccount = Pick<
  User,
  'id' | 'username' | 'firstName' | 'lastName' | 'email'
> & {
  salt: string;
  passwordHash: string;
};
type AuthValue = {
  user: User | null;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (
    username: string,
    password: string,
    profile: Pick<User, 'firstName' | 'lastName' | 'email'>
  ) => Promise<AuthResult>;
  resetPassword: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (
    profile: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>
  ) => void;
  clearLocalData: () => void;
};
const AuthContext = createContext<AuthValue | null>(null);
function readAccounts(): SavedAccount[] {
  const saved = StorageService.get<unknown>(STORAGE_KEYS.accounts, []);
  if (!Array.isArray(saved)) return [];
  return saved.filter(
    (item): item is SavedAccount =>
      typeof item === 'object' &&
      item !== null &&
      'username' in item &&
      typeof item.username === 'string' &&
      'id' in item &&
      typeof item.id === 'number' &&
      'firstName' in item &&
      typeof item.firstName === 'string' &&
      'lastName' in item &&
      typeof item.lastName === 'string' &&
      'email' in item &&
      typeof item.email === 'string' &&
      'salt' in item &&
      typeof item.salt === 'string' &&
      'passwordHash' in item &&
      typeof item.passwordHash === 'string'
  );
}
function createSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}
async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: 100_000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  return Array.from(new Uint8Array(bits), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}
function loadUser(): User | null {
  const saved = StorageService.get<unknown>(STORAGE_KEYS.user, null);
  if (typeof saved !== 'object' || saved === null) return null;
  if (
    !('authSessionVersion' in saved) ||
    saved.authSessionVersion !== AUTH_SESSION_VERSION
  ) {
    StorageService.remove(STORAGE_KEYS.user);
    return null;
  }
  const item = saved as Partial<User>;
  if (typeof item.username !== 'string') {
    StorageService.remove(STORAGE_KEYS.user);
    return null;
  }
  const cleanUsername = item.username.trim().toLowerCase();
  const isDemoAccount = cleanUsername === DEMO_USERNAME;
  const hasRegisteredAccount = readAccounts().some(
    (account) => account.username.toLowerCase() === cleanUsername
  );
  if (!isDemoAccount && !hasRegisteredAccount) {
    StorageService.remove(STORAGE_KEYS.user);
    return null;
  }
  return {
    id: typeof item.id === 'number' ? item.id : 1001,
    username: item.username,
    isLoggedIn: true,
    firstName: item.firstName ?? 'Demo',
    lastName: item.lastName ?? 'Shopper',
    email: item.email ?? `${item.username}@10xshop.local`,
    phone: item.phone ?? ''
  };
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const createUser = (
    username: string,
    profile?: Pick<User, 'firstName' | 'lastName' | 'email'>
  ): User | null => {
    const cleanUsername = username.trim();
    if (!cleanUsername) return null;
    const stableId =
      cleanUsername === DEMO_USERNAME
        ? 1001
        : [...cleanUsername].reduce(
            (hash, character) =>
              (hash * 31 + character.charCodeAt(0)) % 1_000_000,
            1002
          );
    return {
      id: stableId,
      username: cleanUsername,
      isLoggedIn: true,
      firstName:
        profile?.firstName ??
        (cleanUsername === DEMO_USERNAME ? 'Emily' : cleanUsername),
      lastName:
        profile?.lastName ??
        (cleanUsername === DEMO_USERNAME ? 'Johnson' : 'Shopper'),
      email:
        profile?.email ??
        (cleanUsername === DEMO_USERNAME
          ? 'emilys@10xshop.local'
          : `${cleanUsername}@10xshop.local`),
      phone: ''
    };
  };
  const saveUser = (next: User) => {
    setUser(next);
    StorageService.set(STORAGE_KEYS.user, {
      ...next,
      authSessionVersion: AUTH_SESSION_VERSION
    });
  };
  const login = async (
    username: string,
    password: string
  ): Promise<AuthResult> => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || password.length < 6) return 'invalid-credentials';
    if (cleanUsername === DEMO_USERNAME) {
      if (password !== DEMO_PASSWORD) return 'invalid-credentials';
      const demoUser = createUser(DEMO_USERNAME);
      if (!demoUser) return 'unavailable';
      saveUser(demoUser);
      return 'success';
    }
    const account = readAccounts().find(
      (item) => item.username.toLowerCase() === cleanUsername
    );
    if (!account) return 'invalid-credentials';
    try {
      const passwordHash = await hashPassword(password, account.salt);
      if (passwordHash !== account.passwordHash) return 'invalid-credentials';
      saveUser({
        ...account,
        isLoggedIn: true,
        phone: ''
      });
      return 'success';
    } catch {
      return 'unavailable';
    }
  };
  const register = async (
    username: string,
    password: string,
    profile: Pick<User, 'firstName' | 'lastName' | 'email'>
  ): Promise<AuthResult> => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = profile.email.trim().toLowerCase();
    if (!cleanUsername || password.length < 6) return 'unavailable';
    if (cleanUsername === DEMO_USERNAME) return 'username-taken';
    const accounts = readAccounts();
    if (accounts.some((item) => item.username.toLowerCase() === cleanUsername))
      return 'username-taken';
    if (accounts.some((item) => item.email.toLowerCase() === cleanEmail))
      return 'email-taken';
    try {
      const salt = createSalt();
      const next = createUser(cleanUsername, {
        ...profile,
        email: cleanEmail
      });
      if (!next) return 'unavailable';
      const account: SavedAccount = {
        id: next.id,
        username: cleanUsername,
        firstName: next.firstName,
        lastName: next.lastName,
        email: cleanEmail,
        salt,
        passwordHash: await hashPassword(password, salt)
      };
      const updatedAccounts = [...accounts, account];
      StorageService.set(STORAGE_KEYS.accounts, updatedAccounts);
      if (!readAccounts().some((item) => item.username === account.username))
        return 'unavailable';
      saveUser({
        ...next,
        username: cleanUsername,
        email: cleanEmail
      });
      return 'success';
    } catch {
      return 'unavailable';
    }
  };
  const resetPassword = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    const cleanEmail = email.trim().toLowerCase();
    if (password.length < 6) return 'unavailable';
    const accounts = readAccounts();
    const account = accounts.find(
      (item) => item.email.toLowerCase() === cleanEmail
    );
    if (!account) return 'account-not-found';
    try {
      const salt = createSalt();
      const updatedAccount = {
        ...account,
        salt,
        passwordHash: await hashPassword(password, salt)
      };
      const updatedAccounts = accounts.map((item) =>
        item.username === account.username ? updatedAccount : item
      );
      StorageService.set(STORAGE_KEYS.accounts, updatedAccounts);
      if (
        !readAccounts().some(
          (item) =>
            item.username === account.username &&
            item.passwordHash === updatedAccount.passwordHash
        )
      )
        return 'unavailable';
      return 'success';
    } catch {
      return 'unavailable';
    }
  };
  const logout = () => {
    setUser(null);
    StorageService.remove(STORAGE_KEYS.user);
  };
  const updateProfile = (
    profile: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>
  ) => {
    if (!user) return;
    const next = {
      ...user,
      ...profile
    };
    setUser(next);
    StorageService.set(STORAGE_KEYS.user, {
      ...next,
      authSessionVersion: AUTH_SESSION_VERSION
    });
    const accounts = readAccounts();
    if (accounts.some((item) => item.username === user.username)) {
      StorageService.set(
        STORAGE_KEYS.accounts,
        accounts.map((item) =>
          item.username === user.username
            ? {
                ...item,
                firstName: next.firstName,
                lastName: next.lastName,
                email: next.email
              }
            : item
        )
      );
    }
  };
  const clearLocalData = () => {
    StorageService.remove(STORAGE_KEYS.cart);
    StorageService.remove(STORAGE_KEYS.orders);
    StorageService.remove(STORAGE_KEYS.reviews);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        resetPassword,
        logout,
        updateProfile,
        clearLocalData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
export type CartAction =
  | {
      type: 'ADD_ITEM';
      product: Product;
      qty: number;
    }
  | {
      type: 'ADD_LINE';
      item: CartItem;
      qty: number;
    }
  | {
      type: 'SET_QTY';
      productId: number;
      qty: number;
    }
  | {
      type: 'REMOVE_ITEM';
      productId: number;
    }
  | {
      type: 'CLEAR';
    }
  | {
      type: 'APPLY_PROMO';
      code: string;
    }
  | {
      type: 'REMOVE_PROMO';
    };
const cartStorage = new StorageService<CartState>(STORAGE_KEYS.cart);
function loadCart(): CartState {
  const saved = StorageService.get<unknown>(STORAGE_KEYS.cart, null);
  if (
    typeof saved !== 'object' ||
    saved === null ||
    !('items' in saved) ||
    !Array.isArray(saved.items)
  )
    return {
      items: [],
      promoCode: null
    };
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
function cartReducer(state: CartState, action: CartAction): CartState {
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
                ? {
                    ...line,
                    quantity: line.quantity + action.qty
                  }
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
                ? {
                    ...line,
                    quantity: line.quantity + action.qty
                  }
                : line
            )
          : [
              ...state.items,
              {
                ...action.item,
                quantity: action.qty
              }
            ]
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
      return {
        items: [],
        promoCode: null
      };
    case 'APPLY_PROMO':
      return {
        ...state,
        promoCode: action.code
      };
    case 'REMOVE_PROMO':
      return {
        ...state,
        promoCode: null
      };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
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
        dispatch({
          type: 'ADD_ITEM',
          product,
          qty
        });
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
        dispatch({
          type: 'ADD_LINE',
          item,
          qty
        });
        return true;
      },
      setQuantity: (id: number, qty: number) =>
        dispatch({
          type: 'SET_QTY',
          productId: id,
          qty
        }),
      remove: (id: number) =>
        dispatch({
          type: 'REMOVE_ITEM',
          productId: id
        }),
      applyPromo: (code: string) => {
        if (code.trim().toUpperCase() !== '10X10') return false;
        dispatch({
          type: 'APPLY_PROMO',
          code: '10X10'
        });
        return true;
      },
      removePromo: () =>
        dispatch({
          type: 'REMOVE_PROMO'
        }),
      clear: () =>
        dispatch({
          type: 'CLEAR'
        })
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
type Theme = 'light' | 'dark';
const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
} | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    StorageService.get<Theme>(STORAGE_KEYS.theme, 'light')
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    StorageService.set(STORAGE_KEYS.theme, theme);
  }, [theme]);
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle: () =>
          setTheme((current) => (current === 'light' ? 'dark' : 'light'))
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider.');
  return value;
}
function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === 'number' &&
    typeof item.title === 'string' &&
    typeof item.thumbnail === 'string' &&
    typeof item.price === 'number' &&
    typeof item.discountPercentage === 'number' &&
    typeof item.stock === 'number' &&
    typeof item.quantity === 'number'
  );
}
export function loadOrders(): Order[] {
  const saved = StorageService.get<unknown>(STORAGE_KEYS.orders, []);
  if (!Array.isArray(saved)) return [];
  return saved.flatMap((value, index) => {
    if (typeof value !== 'object' || value === null) return [];
    const row = value as Record<string, unknown>;
    const items = Array.isArray(row.items) ? row.items.filter(isCartItem) : [];
    const placedAt =
      typeof row.placedAt === 'string'
        ? row.placedAt
        : typeof row.createdAt === 'string'
          ? row.createdAt
          : new Date().toISOString();
    const rawNumber =
      typeof row.number === 'string'
        ? row.number
        : typeof row.id === 'string'
          ? row.id
          : `10X-${String(index + 1).padStart(5, '0')}`;
    const shippingRow =
      typeof row.shipping === 'object' && row.shipping !== null
        ? (row.shipping as Record<string, unknown>)
        : {};
    const shipping = {
      fullName:
        typeof shippingRow.fullName === 'string'
          ? shippingRow.fullName
          : 'Demo Shopper',
      email: typeof shippingRow.email === 'string' ? shippingRow.email : '',
      phone: typeof shippingRow.phone === 'string' ? shippingRow.phone : '',
      address:
        typeof shippingRow.address === 'string' ? shippingRow.address : '',
      city: typeof shippingRow.city === 'string' ? shippingRow.city : '',
      postalCode:
        typeof shippingRow.postalCode === 'string'
          ? shippingRow.postalCode
          : '',
      country:
        typeof shippingRow.country === 'string'
          ? shippingRow.country
          : 'Georgia'
    };
    return [
      {
        id:
          typeof row.id === 'number'
            ? row.id
            : Date.parse(placedAt) || Date.now() + index,
        number: rawNumber,
        userId: typeof row.userId === 'number' ? row.userId : 1001,
        items,
        shipping,
        subtotal: typeof row.subtotal === 'number' ? row.subtotal : 0,
        discount: typeof row.discount === 'number' ? row.discount : 0,
        shippingCost:
          typeof row.shippingCost === 'number' ? row.shippingCost : 0,
        total: typeof row.total === 'number' ? row.total : 0,
        placedAt
      }
    ];
  });
}
const ordersStorage = new StorageService<Order[]>(STORAGE_KEYS.orders);
export function saveOrder(order: Order): void {
  ordersStorage.write([order, ...loadOrders()]);
}
