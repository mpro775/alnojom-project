import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  ADMIN_ROUTE,
  ADMIN_STORAGE_KEYS,
  LEGACY_ADMIN_STORAGE_KEYS,
  canonicalizeLegacyAdminUrl,
  migrateStorageValue,
  parseLegacyAdminSession,
} from '../src/compatibility/legacy-admin-compat';
import {
  readStoredSession,
  writeStoredSession,
} from '../src/features/admin/session-storage';
import type { AdminSession } from '../src/features/admin/types';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const session: AdminSession = {
  apiBaseUrl: 'http://localhost:3000',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    storeId: '00000000-0000-0000-0000-000000000002',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'owner',
    permissions: ['*'],
    sessionId: 'session-id',
  },
};

function installWindow(storage: MemoryStorage): void {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: storage },
  });
}

describe('Admin route compatibility', () => {
  it('keeps /admin canonical and preserves legacy deep-link state', () => {
    assert.equal(ADMIN_ROUTE, '/admin');
    assert.equal(canonicalizeLegacyAdminUrl('/admin', '?tab=orders'), null);
    assert.equal(canonicalizeLegacyAdminUrl('/merchant'), '/admin');
    assert.equal(canonicalizeLegacyAdminUrl('/merchant', '?tab=orders'), '/admin?tab=orders');
    assert.equal(
      canonicalizeLegacyAdminUrl(
        '/merchant',
        '?tab=supportTickets&ticketId=123',
        '#message-7',
      ),
      '/admin?tab=supportTickets&ticketId=123#message-7',
    );
  });
});

describe('Admin session storage migration', () => {
  it('reads the canonical key without touching a legacy value', () => {
    const storage = new MemoryStorage();
    storage.setItem(ADMIN_STORAGE_KEYS.session, JSON.stringify(session));
    storage.setItem(LEGACY_ADMIN_STORAGE_KEYS.session, 'legacy-value');
    installWindow(storage);

    assert.deepEqual(readStoredSession(), session);
    assert.equal(storage.getItem(LEGACY_ADMIN_STORAGE_KEYS.session), 'legacy-value');
  });

  it('validates and migrates a legacy session exactly once', () => {
    const storage = new MemoryStorage();
    storage.setItem(LEGACY_ADMIN_STORAGE_KEYS.session, JSON.stringify(session));
    installWindow(storage);

    assert.deepEqual(readStoredSession(), session);
    assert.equal(storage.getItem(LEGACY_ADMIN_STORAGE_KEYS.session), null);
    assert.deepEqual(readStoredSession(), session);
  });

  it('rejects invalid legacy data without trusting or copying it', () => {
    const storage = new MemoryStorage();
    storage.setItem(LEGACY_ADMIN_STORAGE_KEYS.session, JSON.stringify({ accessToken: 'only' }));
    installWindow(storage);

    assert.equal(readStoredSession(), null);
    assert.equal(storage.getItem(ADMIN_STORAGE_KEYS.session), null);
  });

  it('writes only canonical keys and does not resurrect legacy keys', () => {
    const storage = new MemoryStorage();
    installWindow(storage);

    writeStoredSession(session);
    assert.deepEqual(parseLegacyAdminSession(storage.getItem(ADMIN_STORAGE_KEYS.session) ?? ''), session);
    assert.equal(storage.getItem(LEGACY_ADMIN_STORAGE_KEYS.session), null);
    assert.equal(storage.getItem(LEGACY_ADMIN_STORAGE_KEYS.apiBaseUrl), null);
  });

  it('does not duplicate a successfully migrated generic storage value', () => {
    const storage = new MemoryStorage();
    storage.setItem('old', 'valid');
    const first = migrateStorageValue({
      storage,
      currentKey: 'new',
      legacyKey: 'old',
      parse: (raw) => (raw === 'valid' ? raw : null),
    });
    const second = migrateStorageValue({
      storage,
      currentKey: 'new',
      legacyKey: 'old',
      parse: (raw) => (raw === 'valid' ? raw : null),
    });
    assert.equal(first, 'valid');
    assert.equal(second, 'valid');
    assert.equal(storage.getItem('old'), null);
  });
});

describe('Admin branding contract', () => {
  it('keeps Alnjoom identity in the app shell, login, and page title', () => {
    const root = path.join(import.meta.dirname, '..');
    const activeBranding = [
      'src/App.tsx',
      'src/features/auth/admin-login-page.tsx',
      'index.html',
    ]
      .map((file) => readFileSync(path.join(root, file), 'utf8'))
      .join('\n');

    assert.match(activeBranding, /Alnjoom Telecom|نجوم تليكوم/u);
    assert.doesNotMatch(activeBranding, /General Ecommerce|Ecommerce Core|لوحة التاجر/u);
    assert.match(readFileSync(path.join(root, 'index.html'), 'utf8'), /<title>لوحة إدارة نجوم تليكوم<\/title>/u);
  });
});
