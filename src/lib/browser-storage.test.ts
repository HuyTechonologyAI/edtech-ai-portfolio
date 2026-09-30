import test from "node:test";
import assert from "node:assert/strict";
import { clearVolatileValue, LOCAL_STORAGE_EVENT, readStoredValue, writeStoredValue } from "./browser-storage.js";

test("storage notifies subscribers and retains updates when persistence is blocked", () => {
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const values = new Map<string, string>();
  const events = new EventTarget();
  let blocked = false;
  let notifications = 0;
  events.addEventListener(LOCAL_STORAGE_EVENT, () => notifications++);
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    localStorage: {
      getItem(key: string) { if (blocked) throw new Error("blocked"); return values.get(key) ?? null; },
      setItem(key: string, value: string) { if (blocked) throw new Error("quota"); values.set(key, value); },
    },
    dispatchEvent: events.dispatchEvent.bind(events),
  } });
  try {
    assert.equal(readStoredValue("progress"), null);
    writeStoredValue("progress", '{"stage":"current"}');
    assert.equal(readStoredValue("progress"), '{"stage":"current"}');
    blocked = true;
    writeStoredValue("progress", '{"stage":"completed"}');
    assert.equal(readStoredValue("progress"), '{"stage":"completed"}');
    assert.equal(notifications, 2);
    blocked = false;
    writeStoredValue("progress", '{"stage":"upcoming"}');
    assert.equal(values.get("progress"), '{"stage":"upcoming"}');
    assert.equal(readStoredValue("progress"), '{"stage":"upcoming"}');
    clearVolatileValue(null);
  } finally {
    clearVolatileValue(null);
    if (savedWindow) Object.defineProperty(globalThis, "window", savedWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
