import { createContext, useContext, useState, type ReactNode } from 'react';
import { StorageService, STORAGE_KEYS } from '../services/storage';
import {
  AUTH_SESSION_VERSION,
  DEMO_PASSWORD,
  DEMO_USERNAME,
  createSalt,
  hashPassword,
  loadUser,
  readAccounts,
  type AuthResult,
  type SavedAccount
} from '../services/auth';
import type { User } from '../types';

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
    const next = { ...user, ...profile };
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
