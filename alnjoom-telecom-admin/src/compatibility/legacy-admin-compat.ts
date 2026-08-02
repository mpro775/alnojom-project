/**
 * Temporary compatibility boundary for the pre-Alnjoom Admin application.
 *
 * Removal target: after one deployed Admin compatibility window and after
 * telemetry confirms that legacy routes and storage keys are no longer used.
 */
export const LEGACY_ADMIN_ROUTE = '/merchant';
export const ADMIN_ROUTE = '/admin';

export const ADMIN_STORAGE_KEYS = {
  session: 'alnjoom.admin.session.v1',
  apiBaseUrl: 'alnjoom.admin.apiBaseUrl.v1',
  accessibilityPreferences: 'alnjoom.admin.accessibility.preferences',
  themeMode: 'alnjoom.admin.theme.mode.v1',
} as const;

export const LEGACY_ADMIN_STORAGE_KEYS = {
  session: 'merchant.session.v1',
  apiBaseUrl: 'merchant.apiBaseUrl.v1',
  accessibilityPreferences: 'ecommerce_core.merchant.accessibility.preferences',
  themeMode: 'admin.theme.mode.v1',
} as const;

export const ADMIN_ACCESSIBILITY_EVENT = 'alnjoom:open-accessibility-settings';
export const LEGACY_ADMIN_ACCESSIBILITY_EVENT = 'ecommerce_core:open-accessibility-settings';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function isLegacyAdminRoute(pathname: string): boolean {
  return pathname === LEGACY_ADMIN_ROUTE || pathname === `${LEGACY_ADMIN_ROUTE}/`;
}

export function canonicalizeLegacyAdminUrl(
  pathname: string,
  search = '',
  hash = '',
): string | null {
  return isLegacyAdminRoute(pathname) ? `${ADMIN_ROUTE}${search}${hash}` : null;
}

export function migrateStorageValue<T>(input: {
  storage: StorageLike;
  currentKey: string;
  legacyKey: string;
  parse: (raw: string) => T | null;
}): T | null {
  const currentRaw = input.storage.getItem(input.currentKey);
  if (currentRaw !== null) {
    return input.parse(currentRaw);
  }

  const legacyRaw = input.storage.getItem(input.legacyKey);
  if (legacyRaw === null) {
    return null;
  }

  const migrated = input.parse(legacyRaw);
  if (migrated === null) {
    return null;
  }

  input.storage.setItem(input.currentKey, legacyRaw);
  input.storage.removeItem(input.legacyKey);
  return migrated;
}

export function parseLegacyAdminSession(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') return null;

    const user = parsed.user as Record<string, unknown> | null | undefined;
    if (
      typeof parsed.accessToken !== 'string' ||
      parsed.accessToken.length === 0 ||
      typeof parsed.refreshToken !== 'string' ||
      parsed.refreshToken.length === 0 ||
      !user ||
      typeof user.storeId !== 'string' ||
      user.storeId.length === 0
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
