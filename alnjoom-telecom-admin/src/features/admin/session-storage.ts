import type { AdminSession } from './types';
import {
  ADMIN_STORAGE_KEYS,
  LEGACY_ADMIN_STORAGE_KEYS,
  migrateStorageValue,
  parseLegacyAdminSession,
} from '../../compatibility/legacy-admin-compat';

function normalizeApiBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function parseSession(raw: string): AdminSession | null {
  return parseLegacyAdminSession(raw) as AdminSession | null;
}

function parseApiBaseUrl(raw: string): string | null {
  const normalized = normalizeApiBaseUrl(raw);
  return normalized.length > 0 ? normalized : null;
}

function readEnvApiBaseUrl(): string {
  const envValue = import.meta.env.VITE_API_BASE_URL;
  if (typeof envValue !== 'string') {
    return '';
  }

  return normalizeApiBaseUrl(envValue);
}

export function readStoredSession(): AdminSession | null {
  try {
    return migrateStorageValue({
      storage: window.localStorage,
      currentKey: ADMIN_STORAGE_KEYS.session,
      legacyKey: LEGACY_ADMIN_STORAGE_KEYS.session,
      parse: parseSession,
    });
  } catch {
    return null;
  }
}

export function writeStoredSession(session: AdminSession | null): void {
  try {
    if (!session) {
      window.localStorage.removeItem(ADMIN_STORAGE_KEYS.session);
      window.localStorage.removeItem(LEGACY_ADMIN_STORAGE_KEYS.session);
      return;
    }

    window.localStorage.setItem(ADMIN_STORAGE_KEYS.session, JSON.stringify(session));
    window.localStorage.setItem(
      ADMIN_STORAGE_KEYS.apiBaseUrl,
      normalizeApiBaseUrl(session.apiBaseUrl),
    );
  } catch {
    return;
  }
}

export function readStoredApiBaseUrl(): string {
  const envApiBaseUrl = readEnvApiBaseUrl();
  if (envApiBaseUrl) {
    return envApiBaseUrl;
  }

  try {
    return (
      migrateStorageValue({
        storage: window.localStorage,
        currentKey: ADMIN_STORAGE_KEYS.apiBaseUrl,
        legacyKey: LEGACY_ADMIN_STORAGE_KEYS.apiBaseUrl,
        parse: parseApiBaseUrl,
      }) ?? 'http://localhost:3000'
    );
  } catch {
    return 'http://localhost:3000';
  }
}
