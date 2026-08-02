/**
 * Runtime compatibility values retained for one deployment transition window.
 * TODO(ALNJOOM-2026-11-01): remove after production configuration, dashboards,
 * and deployed clients have all moved to the canonical Admin/Alnjoom names.
 */
export const LEGACY_ADMIN_BASE_URL_ENV = 'MERCHANT_ADMIN_BASE_URL';
export const LEGACY_INFO_METRIC_NAME = 'ecommerce_core_info';
export const LEGACY_WEAK_SECRET_VALUES = [
  'ecommerce_core-local-access-secret-change-me',
  'ecommerce_core-local-customer-access-secret-change-me',
  'ecommerce_core-local-owner-registration-otp-secret-change-me',
  'ecommerce_core-local-token-hash-secret-change-me',
  'ecommerce_core-local-webhook-secret',
] as const;
