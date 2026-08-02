import { describe, expect, it } from "vitest";
import { CART_STORAGE_KEY, readCartId, writeCartId } from "@/features/cart/storage";
import { clearCheckoutKey, getCheckoutKey, stableFingerprint } from "@/features/checkout/idempotency";
import { safeReturnTo } from "@/lib/i18n/locales";

class MemoryStorage {
  data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

describe("cart local id behavior", () => {
  it("persists only valid UUID-shaped cart ids and clears them", () => {
    const storage = new MemoryStorage();
    writeCartId(storage, "11111111-1111-4111-8111-111111111111");
    expect(readCartId(storage)).toBe("11111111-1111-4111-8111-111111111111");
    storage.setItem(CART_STORAGE_KEY, "not-a-cart");
    expect(readCartId(storage)).toBeNull();
    writeCartId(storage, null);
    expect(storage.getItem(CART_STORAGE_KEY)).toBeNull();
  });
});

describe("checkout idempotency", () => {
  it("reuses a key for the exact payload and rotates it for a material change", () => {
    const storage = new MemoryStorage();
    const first = getCheckoutKey({ cartId: "1", note: "a" }, storage);
    const replay = getCheckoutKey({ note: "a", cartId: "1" }, storage);
    const changed = getCheckoutKey({ cartId: "1", note: "b" }, storage);
    expect(replay).toBe(first);
    expect(changed).not.toBe(first);
    expect(first.length).toBeGreaterThanOrEqual(16);
    clearCheckoutKey(storage);
  });
  it("creates stable fingerprints independent of object key order", () => {
    expect(stableFingerprint({ b: 2, a: { d: 4, c: 3 } })).toBe(stableFingerprint({ a: { c: 3, d: 4 }, b: 2 }));
  });
});

describe("auth return flow", () => {
  it("accepts same-origin paths and rejects open redirects", () => {
    expect(safeReturnTo("/en/product/phone?x=1", "en")).toBe("/en/product/phone?x=1");
    expect(safeReturnTo("//evil.example", "ar")).toBe("/account");
    expect(safeReturnTo("https://evil.example", "en")).toBe("/en/account");
  });
});
