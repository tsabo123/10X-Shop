import { StorageService, STORAGE_KEYS } from './storage';
import type { User } from '../types';

export const DEMO_USERNAME = 'emilys';
export const DEMO_PASSWORD = 'emilyspass';
export const AUTH_SESSION_VERSION = 1;

export type AuthResult =
  | 'success'
  | 'invalid-credentials'
  | 'username-taken'
  | 'email-taken'
  | 'account-not-found'
  | 'unavailable';

export type SavedAccount = Pick<
  User,
  'id' | 'username' | 'firstName' | 'lastName' | 'email'
> & {
  salt: string;
  passwordHash: string;
};

export function readAccounts(): SavedAccount[] {
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

export function createSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
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
