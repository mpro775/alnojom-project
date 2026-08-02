import { AdminDashboard } from './admin-dashboard';
import { AdminLogin } from './admin-login';
import { useAdminSession } from './use-admin-session';
import { useLocalStorageState } from '../../lib/use-local-storage-state';
import {
  ADMIN_STORAGE_KEYS,
  LEGACY_ADMIN_STORAGE_KEYS,
} from '../../compatibility/legacy-admin-compat';

export function AdminApp() {
  const [session, setSession] = useAdminSession();
  const [themeMode, setThemeMode] = useLocalStorageState(
    ADMIN_STORAGE_KEYS.themeMode,
    'light',
    [LEGACY_ADMIN_STORAGE_KEYS.themeMode],
  );
  const resolvedThemeMode = themeMode === 'dark' ? 'dark' : 'light';

  if (!session) {
    return <AdminLogin onLoggedIn={setSession} />;
  }

  return (
    <AdminDashboard
      session={session}
      onSessionUpdate={setSession}
      themeMode={resolvedThemeMode}
      onToggleThemeMode={() => setThemeMode(resolvedThemeMode === 'dark' ? 'light' : 'dark')}
      onSignedOut={() => setSession(null)}
    />
  );
}
