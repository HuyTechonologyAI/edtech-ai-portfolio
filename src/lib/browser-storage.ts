// Keep the UI usable when a browser blocks persistence (private mode or quota).
const volatileValues = new Map<string, string>();
export const LOCAL_STORAGE_EVENT = "app-local-storage";

export function readStoredValue(key: string): string | null {
  if (volatileValues.has(key)) return volatileValues.get(key)!;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function writeStoredValue(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
    volatileValues.delete(key);
  } catch {
    volatileValues.set(key, value);
  }
  window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT));
}

export function clearVolatileValue(key: string | null): void {
  if (key === null) volatileValues.clear();
  else volatileValues.delete(key);
}
