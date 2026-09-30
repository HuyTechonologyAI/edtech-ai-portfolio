"use client";

import { useCallback, useMemo, useSyncExternalStore, type SetStateAction } from "react";
import { clearVolatileValue, LOCAL_STORAGE_EVENT, readStoredValue, writeStoredValue } from "@/lib/browser-storage";

const subscribeHydration = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(subscribeHydration, () => true, () => false);
}

/** Read browser storage after hydration, with a stable server snapshot. */
export function useLocalStorageState<T>(key: string, fallback: T) {
  const subscribe = useCallback((notify: () => void) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) {
        clearVolatileValue(event.key);
        notify();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCAL_STORAGE_EVENT, notify);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCAL_STORAGE_EVENT, notify);
    };
  }, [key]);
  const getSnapshot = useCallback(() => {
    return readStoredValue(key);
  }, [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const value = useMemo(() => {
    if (raw === null) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  }, [raw, fallback]);
  const setValue = useCallback((next: SetStateAction<T>) => {
    let previous = fallback;
    try { const stored = getSnapshot(); if (stored !== null) previous = JSON.parse(stored) as T; } catch {}
    const resolved = typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
    writeStoredValue(key, JSON.stringify(resolved));
  }, [key, fallback, getSnapshot]);
  return [value, setValue] as const;
}
