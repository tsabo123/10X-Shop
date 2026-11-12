import { StorageService, STORAGE_KEYS } from './storage';
import type { User } from '../types';

export const AUTH_SESSION_VERSION = 1;

export type AuthResult =
  | 'success'
  | 'invalid-credentials'
  | 'username-taken'
  | 'email-taken'
  | 'account-not-found'
  | 'unavailable';

export function buildLocalUser(username: string): User {
  const clean = username.trim();
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  return {
    id: 1001,
    username: clean,
    isLoggedIn: true,
    firstName: capitalized || 'Demo',
    lastName: 'Shopper',
    email: `${clean.toLowerCase()}@10xshop.local`,
    phone: ''
  };
}

export function loadUser(): User | null {
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
  if (typeof item.username !== 'string' || !item.username.trim()) {
    StorageService.remove(STORAGE_KEYS.user);
    return null;
  }
  return {
    id: typeof item.id === 'number' ? item.id : 1001,
    username: item.username.trim(),
    isLoggedIn: true,
    firstName: item.firstName ?? 'Demo',
    lastName: item.lastName ?? 'Shopper',
    email: item.email ?? `${item.username.trim().toLowerCase()}@10xshop.local`,
    phone: item.phone ?? ''
  };
}
