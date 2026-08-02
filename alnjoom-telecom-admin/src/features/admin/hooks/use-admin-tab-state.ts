import { useCallback, useEffect, useState } from 'react';
import { isAdminTabKey } from '../constants/admin-navigation';
import type { AdminTabKey } from '../admin-dashboard.types';

interface SetAdminTabOptions {
  replace?: boolean;
}

type SetAdminTab = (nextTab: AdminTabKey, options?: SetAdminTabOptions) => void;

const TAB_QUERY_PARAM = 'tab';

function readTabFromLocation(defaultTab: AdminTabKey): AdminTabKey {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get(TAB_QUERY_PARAM);
  if (!tab || !isAdminTabKey(tab)) {
    return defaultTab;
  }
  return tab;
}

function writeTabToLocation(tab: AdminTabKey, replace = false): void {
  const url = new URL(window.location.href);
  url.searchParams.set(TAB_QUERY_PARAM, tab);
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  if (replace) {
    window.history.replaceState({}, '', nextUrl);
    return;
  }
  window.history.pushState({}, '', nextUrl);
}

export function useAdminTabState(defaultTab: AdminTabKey): [AdminTabKey, SetAdminTab] {
  const [activeTab, setActiveTabState] = useState<AdminTabKey>(() => readTabFromLocation(defaultTab));

  useEffect(() => {
    const currentTab = readTabFromLocation(defaultTab);
    setActiveTabState(currentTab);

    const params = new URLSearchParams(window.location.search);
    const rawTab = params.get(TAB_QUERY_PARAM);
    if (rawTab !== currentTab) {
      writeTabToLocation(currentTab, true);
    }

    const handlePopState = () => {
      setActiveTabState(readTabFromLocation(defaultTab));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [defaultTab]);

  const setActiveTab = useCallback<SetAdminTab>((nextTab, options) => {
    setActiveTabState(nextTab);
    writeTabToLocation(nextTab, options?.replace ?? false);
  }, []);

  return [activeTab, setActiveTab];
}
