const STORAGE_KEY = "alnjoom.checkout.attempt";

interface StoredAttempt { fingerprint: string; key: string }

export function stableFingerprint(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, sortValue(item)]));
  }
  return value;
}

export function getCheckoutKey(payload: unknown, storage: Pick<Storage, "getItem" | "setItem">): string {
  const fingerprint = stableFingerprint(payload);
  const current = parseAttempt(storage.getItem(STORAGE_KEY));
  if (current?.fingerprint === fingerprint) return current.key;
  const key = `alnjoom-${crypto.randomUUID()}-${Date.now().toString(36)}`;
  storage.setItem(STORAGE_KEY, JSON.stringify({ fingerprint, key } satisfies StoredAttempt));
  return key;
}

export function clearCheckoutKey(storage: Pick<Storage, "removeItem">) {
  storage.removeItem(STORAGE_KEY);
}

function parseAttempt(value: string | null): StoredAttempt | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredAttempt>;
    return typeof parsed.fingerprint === "string" && typeof parsed.key === "string" ? { fingerprint: parsed.fingerprint, key: parsed.key } : null;
  } catch {
    return null;
  }
}
