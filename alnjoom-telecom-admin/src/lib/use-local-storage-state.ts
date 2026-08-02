import { useEffect, useState } from 'react';

export function useLocalStorageState(key: string, initialValue: string, legacyKeys: string[] = []) {
  const [value, setValue] = useState(() => readLocalStorageValue(key, initialValue, legacyKeys));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      return;
    }
  }, [key, value]);

  return [value, setValue] as const;
}

function readLocalStorageValue(key: string, initialValue: string, legacyKeys: string[]): string {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored !== null) return stored;

    for (const legacyKey of legacyKeys) {
      const legacyValue = window.localStorage.getItem(legacyKey);
      if (legacyValue === null) continue;
      window.localStorage.setItem(key, legacyValue);
      window.localStorage.removeItem(legacyKey);
      return legacyValue;
    }

    return initialValue;
  } catch {
    return initialValue;
  }
}
