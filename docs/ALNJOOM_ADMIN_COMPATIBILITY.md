# Alnjoom Admin compatibility window

Canonical frontend links and backend operator endpoints use `/admin`.

The following legacy contracts remain temporarily supported for deployed-client
and persisted-deep-link compatibility:

- Frontend `/merchant` is replaced with `/admin` while preserving query and hash state.
- Backend `/merchant/payment-methods` delegates to the canonical Admin controller.
- Backend `/merchant/fulfillment` delegates to the canonical Admin controller.
- `merchant.session.v1`, `merchant.apiBaseUrl.v1`, and the former accessibility
  keys are read once, validated, migrated, and removed after successful migration.
- `MERCHANT_ADMIN_BASE_URL` remains a fallback only when `ADMIN_BASE_URL` is absent.
- `ecommerce_core_info` is emitted as a transition metric alongside the configured
  canonical metric name.
- Historical backup names using `ecommerce_core_store_` remain listable/restorable.

No compatibility route contains separate commerce logic or altered authorization.
The target removal checkpoint is **2026-11-01**, after deployed-client, storage,
route-usage, dashboard, and backup verification.
