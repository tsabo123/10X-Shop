export class StorageService {
  static get<T>(key: string, fallback: T): T {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; }
    catch { return fallback; }
  }
  static set<T>(key: string, value: T): void { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage may be disabled. */ } }
  static remove(key: string): void { try { localStorage.removeItem(key); } catch { /* Storage may be disabled. */ } }
}
