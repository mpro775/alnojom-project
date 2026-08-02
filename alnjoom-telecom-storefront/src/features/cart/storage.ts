export const CART_STORAGE_KEY = "alnjoom.cart.id";

export function readCartId(storage: Pick<Storage, "getItem"> | null): string | null {
  if (!storage) return null;
  const value = storage.getItem(CART_STORAGE_KEY)?.trim() ?? "";
  return /^[0-9a-fA-F-]{36}$/.test(value) ? value : null;
}

export function writeCartId(storage: Pick<Storage, "setItem" | "removeItem"> | null, cartId: string | null) {
  if (!storage) return;
  if (cartId) storage.setItem(CART_STORAGE_KEY, cartId);
  else storage.removeItem(CART_STORAGE_KEY);
}
