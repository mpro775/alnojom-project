import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Alert, Snackbar, useMediaQuery, useTheme } from '@mui/material';
import {
  clearAdminSessionCache,
  adminRequestJson,
  type AdminRequestOptions,
} from './api-client';
import {
  ADMIN_DRAWER_WIDTH,
  ADMIN_NAV_ITEMS,
  ADMIN_PRIMARY_MOBILE_TABS,
} from './constants/admin-navigation';
import { AdminDashboardLayout } from './components/layout/admin-dashboard-layout';
import { AdminMobileNav } from './components/navigation/admin-mobile-nav';
import { AdminSidebar } from './components/navigation/admin-sidebar';
import { AdminTopBar } from './components/navigation/admin-top-bar';
import { useAdminTabState } from './hooks/use-admin-tab-state';
import { useAdminNotificationsRealtime } from './hooks/use-admin-notifications-realtime';
import { useNotificationSound } from './hooks/use-notification-sound';
import { renderAdminPanel } from './panel-registry';

import type {
  AdminRequester,
  AdminTabKey,
  AdminNavItem,
} from './admin-dashboard.types';
import type { AdminSession, StoreSettings } from './types';

export type {
  AdminNavItem,
  AdminPanelProps,
  AdminRequester,
  AdminTabKey,
} from './admin-dashboard.types';

interface AdminDashboardProps {
  session: AdminSession;
  onSessionUpdate: (session: AdminSession) => void;
  themeMode: 'light' | 'dark';
  onToggleThemeMode: (origin?: { x: number; y: number }) => void;
  onSignedOut: () => void;
}

export function AdminDashboard({
  session,
  onSessionUpdate,
  themeMode,
  onToggleThemeMode,
  onSignedOut,
}: AdminDashboardProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useAdminTabState('overview');
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { play: playNotificationSound } = useNotificationSound();

  const request = useCallback<AdminRequester>(
    async <T,>(path: string, init?: RequestInit, options?: AdminRequestOptions) =>
      adminRequestJson<T>({
        session,
        path,
        init,
        options,
        onSessionUpdate,
        onSessionExpired: onSignedOut,
      }),
    [onSessionUpdate, onSignedOut, session],
  );

  const handleNotificationCreated = useCallback(
    (payload: unknown) => {
      playNotificationSound();
      const data = payload as Record<string, unknown> | null | undefined;
      const title = (data?.title as string) || 'وصل إشعار جديد';
      setToastMessage(title);
      setToastOpen(true);
    },
    [playNotificationSound],
  );

  const { unreadCount: notificationUnreadCount, notificationRealtimeVersion } =
    useAdminNotificationsRealtime(session, request, handleNotificationCreated);

  useEffect(() => {
    if (isDesktop) {
      setMobileSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    let cancelled = false;

    async function loadStoreSettings(): Promise<void> {
      try {
        const settings = await request<StoreSettings>('/store/settings');
        if (!cancelled) {
          setStoreSettings(settings ?? null);
        }
      } catch {
        if (!cancelled) {
          setStoreSettings(null);
        }
      }
    }

    loadStoreSettings().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [request]);

  const activeLabel = useMemo(() => {
    for (const group of ADMIN_NAV_ITEMS) {
      if (group.children) {
        const found = group.children.find((child) => child.key === activeTab);
        if (found) return found.label;
      } else if (group.key === activeTab) {
        return group.label;
      }
    }
    return 'لوحة التحكم';
  }, [activeTab]);

  const primaryMobileItems = useMemo<AdminNavItem[]>(() => {
    const allItems: AdminNavItem[] = [];
    ADMIN_NAV_ITEMS.forEach((group) => {
      if (group.children) {
        allItems.push(...(group.children as AdminNavItem[]));
      } else {
        allItems.push(group as AdminNavItem);
      }
    });
    return allItems.filter((item) =>
      ADMIN_PRIMARY_MOBILE_TABS.includes(item.key as AdminTabKey),
    );
  }, []);



  const handleOpenNavigation = useCallback(() => {
    setMobileSidebarOpen(true);
  }, []);

  const handleCloseNavigation = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const handleSelectTab = useCallback(
    (nextTab: AdminTabKey) => {
      setActiveTab(nextTab);
      setBannerMessage('');
      if (!isDesktop) {
        setMobileSidebarOpen(false);
      }
    },
    [isDesktop, setActiveTab],
  );

  const handleOpenUserMenu = useCallback((event: MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  }, []);

  const handleCloseUserMenu = useCallback(() => {
    setUserMenuAnchorEl(null);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore sign-out network failures and clear session locally.
    }
    clearAdminSessionCache();
    onSignedOut();
  }, [onSignedOut, request]);

  const handleSignOut = useCallback(() => {
    handleCloseUserMenu();
    signOut().catch(() => undefined);
  }, [handleCloseUserMenu, signOut]);

  return (
    <>
      <AdminDashboardLayout
        bannerMessage={bannerMessage}
        sidebar={
        <AdminSidebar
          drawerWidth={ADMIN_DRAWER_WIDTH}
          navItems={ADMIN_NAV_ITEMS}
          activeTab={activeTab}
          isDesktop={isDesktop}
          mobileOpen={mobileSidebarOpen}
          storeName={storeSettings?.name ?? null}
          onCloseMobile={handleCloseNavigation}
          onSelectTab={handleSelectTab}
        />
      }
      topBar={
        <AdminTopBar
          activeLabel={activeLabel}
          session={session}

          storeName={storeSettings?.name ?? null}
          themeMode={themeMode}
          showNavigationToggle={!isDesktop}
          userMenuAnchorEl={userMenuAnchorEl}
          onToggleThemeMode={onToggleThemeMode}
          onOpenNavigation={handleOpenNavigation}
          onOpenUserMenu={handleOpenUserMenu}
          onCloseUserMenu={handleCloseUserMenu}
          onGoToStoreSettings={() => {
            handleCloseUserMenu();
            handleSelectTab('store');
          }}
          onGoToStaff={() => {
            handleCloseUserMenu();
            handleSelectTab('staff');
          }}
          notificationUnreadCount={notificationUnreadCount}
          onOpenNotifications={() => handleSelectTab('notificationsCenter')}
          request={request}
          notificationRealtimeVersion={notificationRealtimeVersion}
          onSignOut={handleSignOut}
        />
      }
      mobileNavigation={
        <AdminMobileNav
          primaryItems={primaryMobileItems}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenMore={handleOpenNavigation}
        />
      }
    >
      {renderAdminPanel(activeTab, {
        session,
        request,
        storeSettings,
        onStoreSettingsUpdated: setStoreSettings,
        notificationRealtimeVersion,
        onNavigate: handleSelectTab,
      })}
    </AdminDashboardLayout>

    <Snackbar
      open={toastOpen}
      autoHideDuration={4000}
      onClose={() => setToastOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="info" variant="filled" onClose={() => setToastOpen(false)}>
        {toastMessage}
      </Alert>
    </Snackbar>
    </>
  );
}
