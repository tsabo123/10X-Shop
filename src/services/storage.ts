export class StorageService<T> {
  constructor(private readonly key: string) {}
  read(): T | null {
    try {
      const value = localStorage.getItem(this.key);
      return value ? JSON.parse(value) as T : null;
    } catch {
      return null;
    }
  }
  write(value: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(value));
    } catch {/* Storage may be disabled. */}
  }
  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {/* Storage may be disabled. */}
  }
  static get<Value>(key: string, fallback: Value): Value {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) as Value : fallback;
    } catch {
      return fallback;
    }
  }
  static set<Value>(key: string, value: Value): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {/* Storage may be disabled. */}
  }
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {/* Storage may be disabled. */}
  }
}
