import type { ReactElement } from 'react';
import type { AdminRequestOptions } from './api-client';
import type { AdminSession, StoreSettings } from './types';

export type AdminTabKey =
  | 'overview'
  | 'analyticsGeneral'
  | 'analyticsLive'
  | 'analyticsProducts'
  | 'analyticsOperations'
  | 'analyticsPayments'
  | 'analyticsFinancial'
  | 'analyticsShipments'
  | 'reportsCustomers'
  | 'reportsSales'
  | 'reportsInventory'
  | 'store'
  | 'products'
  | 'inventory'
  | 'warehouses'
  | 'attributes'
  | 'filters'
  | 'categories'
  | 'brands'
  | 'customers'
  | 'customerReviews'
  | 'customerQuestions'
  | 'supportTickets'
  | 'notificationsCenter'
  | 'abandonedCarts'
  | 'restockAlerts'
  | 'orders'
  | 'payments'
  | 'shipping'
  | 'promotions'
  | 'advancedPromotions'
  | 'coupons'
  | 'affiliates'
  | 'loyalty'
  | 'staff'
  | 'webhooks';

export type AdminRequester = <T>(
  path: string,
  init?: RequestInit,
  options?: AdminRequestOptions,
) => Promise<T | null>;

export interface AdminPanelProps {
  session: AdminSession;
  request: AdminRequester;
  storeSettings?: StoreSettings | null;
  onStoreSettingsUpdated?: (settings: StoreSettings) => void;
  notificationRealtimeVersion?: number;
  onNavigate?: (tab: AdminTabKey) => void;
}

export interface AdminNavItem {
  key: AdminTabKey | string;
  label: string;
  icon?: ReactElement;
  children?: { key: AdminTabKey; label: string; icon?: ReactElement }[];
}
