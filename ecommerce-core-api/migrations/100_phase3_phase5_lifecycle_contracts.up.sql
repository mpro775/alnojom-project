-- Phase 3 + Phase 5 lifecycle and financial contracts.
-- Ambiguous commercial state is deliberately rejected before any schema mutation.

DO $$
DECLARE
  issue_count integer;
BEGIN
  SELECT COUNT(*) INTO issue_count
  FROM orders o
  WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);
  IF issue_count > 0 THEN
    RAISE EXCEPTION 'Lifecycle migration blocked: % orders have no items', issue_count;
  END IF;

  SELECT COUNT(*) INTO issue_count
  FROM orders o
  WHERE NOT EXISTS (
    SELECT 1 FROM payments p WHERE p.store_id = o.store_id AND p.order_id = o.id
  );
  IF issue_count > 0 THEN
    RAISE EXCEPTION 'Lifecycle migration blocked: % orders have no payment', issue_count;
  END IF;

  SELECT COUNT(*) INTO issue_count
  FROM payments
  WHERE status = 'refunded';
  IF issue_count > 0 THEN
    RAISE EXCEPTION 'Lifecycle migration blocked: % legacy refunded payments require verified refund amounts', issue_count;
  END IF;

  SELECT COUNT(*) INTO issue_count
  FROM orders o
  JOIN payments p ON p.store_id = o.store_id AND p.order_id = o.id
  WHERE o.status IN ('completed', 'returned') AND p.status <> 'approved';
  IF issue_count > 0 THEN
    RAISE EXCEPTION 'Lifecycle migration blocked: % terminal orders have non-approved payment', issue_count;
  END IF;

  SELECT COUNT(*) INTO issue_count
  FROM orders o
  JOIN inventory_reservations r ON r.store_id = o.store_id AND r.order_id = o.id
  WHERE o.status IN ('completed', 'cancelled', 'returned') AND r.status = 'active';
  IF issue_count > 0 THEN
    RAISE EXCEPTION 'Lifecycle migration blocked: % terminal orders retain active reservations', issue_count;
  END IF;
END $$;

ALTER TABLE orders
  ADD COLUMN version BIGINT NOT NULL DEFAULT 1,
  ADD COLUMN legacy_returned_at TIMESTAMPTZ,
  ADD COLUMN legacy_return_note TEXT,
  ADD COLUMN confirmed_at TIMESTAMPTZ,
  ADD COLUMN completed_at TIMESTAMPTZ,
  ADD COLUMN cancelled_at TIMESTAMPTZ,
  ADD COLUMN tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN refunded_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;

UPDATE orders
SET legacy_returned_at = COALESCE(updated_at, created_at),
    legacy_return_note = COALESCE(note, 'Historical returned state preserved by migration 100')
WHERE status = 'returned';

UPDATE orders
SET fulfillment_type = COALESCE(
      fulfillment_type,
      CASE
        WHEN shipping_method_snapshot->>'type' = 'store_pickup' THEN 'pickup'
        WHEN shipping_method_id IS NOT NULL OR shipping_zone_id IS NOT NULL THEN 'delivery'
        ELSE 'manual_coordination'
      END
    ),
    fulfillment_status = CASE
      WHEN status IN ('completed', 'returned') THEN 'fulfilled'
      WHEN status = 'cancelled' THEN 'cancelled'
      WHEN status = 'preparing' THEN 'preparing'
      WHEN status = 'out_for_delivery' THEN 'out_for_delivery'
      WHEN fulfillment_status = 'not_started' THEN 'unfulfilled'
      WHEN fulfillment_status = 'ready_for_pickup' THEN 'ready'
      WHEN fulfillment_status IN ('delivered', 'picked_up') THEN 'fulfilled'
      WHEN fulfillment_status IN ('failed', 'out_for_delivery') THEN fulfillment_status
      ELSE 'unfulfilled'
    END,
    status = CASE
      WHEN status IN ('preparing', 'out_for_delivery') THEN 'confirmed'
      WHEN status = 'returned' THEN 'completed'
      ELSE status
    END,
    confirmed_at = CASE
      WHEN status IN ('confirmed', 'preparing', 'out_for_delivery', 'completed', 'returned')
        THEN COALESCE(confirmed_at, updated_at, created_at)
      ELSE confirmed_at
    END,
    completed_at = CASE
      WHEN status IN ('completed', 'returned') THEN COALESCE(completed_at, updated_at, created_at)
      ELSE completed_at
    END,
    cancelled_at = CASE
      WHEN status = 'cancelled' THEN COALESCE(cancelled_at, updated_at, created_at)
      ELSE cancelled_at
    END;

ALTER TABLE orders
  ALTER COLUMN fulfillment_type SET NOT NULL,
  ALTER COLUMN fulfillment_status SET DEFAULT 'unfulfilled',
  DROP CONSTRAINT IF EXISTS orders_status_check,
  DROP CONSTRAINT IF EXISTS orders_fulfillment_status_check,
  DROP CONSTRAINT IF EXISTS orders_fulfillment_type_check,
  ADD CONSTRAINT orders_status_check
    CHECK (status IN ('new', 'confirmed', 'completed', 'cancelled')),
  ADD CONSTRAINT orders_fulfillment_status_check
    CHECK (fulfillment_status IN (
      'unfulfilled', 'preparing', 'ready', 'out_for_delivery',
      'fulfilled', 'failed', 'cancelled'
    )),
  ADD CONSTRAINT orders_fulfillment_type_check
    CHECK (fulfillment_type IN ('delivery', 'pickup', 'external_shipping', 'manual_coordination')),
  ADD CONSTRAINT orders_terminal_fulfillment_check CHECK (
    (status <> 'completed' OR fulfillment_status = 'fulfilled')
    AND (status <> 'cancelled' OR fulfillment_status = 'cancelled')
  ),
  ADD CONSTRAINT orders_commercial_money_check CHECK (
    subtotal >= 0 AND shipping_fee >= 0 AND discount_total >= 0 AND tax_amount >= 0
    AND total >= 0 AND paid_amount >= 0 AND refunded_amount >= 0
    AND paid_amount <= total AND refunded_amount <= paid_amount
  );

CREATE INDEX idx_orders_store_lifecycle
  ON orders (store_id, status, fulfillment_status, created_at DESC);

ALTER TABLE payments
  ADD COLUMN paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN refunded_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN currency_code VARCHAR(3),
  ADD COLUMN version BIGINT NOT NULL DEFAULT 1,
  ADD COLUMN submission_version INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN review_started_at TIMESTAMPTZ,
  ADD COLUMN expires_at TIMESTAMPTZ,
  ADD COLUMN collected_at TIMESTAMPTZ,
  ADD COLUMN collection_reference TEXT;

UPDATE payments p
SET paid_amount = CASE WHEN p.status = 'approved' THEN p.amount ELSE 0 END,
    currency_code = COALESCE(o.currency_code, 'YER'),
    version = GREATEST(1, p.status_version::bigint),
    submission_version = CASE
      WHEN p.status IN ('under_review', 'approved', 'rejected') OR p.customer_submitted_at IS NOT NULL THEN 1
      ELSE 0
    END,
    review_started_at = CASE WHEN p.status = 'under_review' THEN COALESCE(p.customer_submitted_at, p.updated_at) END
FROM orders o
WHERE o.id = p.order_id AND o.store_id = p.store_id;

ALTER TABLE payments
  ALTER COLUMN currency_code SET NOT NULL,
  DROP CONSTRAINT IF EXISTS payments_status_check,
  ADD CONSTRAINT payments_status_check CHECK (status IN (
    'pending', 'submitted', 'under_review', 'approved', 'rejected',
    'expired', 'cancelled', 'partially_refunded', 'refunded'
  )),
  ADD CONSTRAINT payments_financial_projection_check CHECK (
    amount >= 0 AND paid_amount >= 0 AND refunded_amount >= 0
    AND paid_amount <= amount AND refunded_amount <= paid_amount
  ),
  ADD CONSTRAINT payments_status_financial_check CHECK (
    (status <> 'approved' OR paid_amount > 0)
    AND (status NOT IN ('pending', 'submitted', 'under_review', 'rejected', 'expired', 'cancelled')
      OR refunded_amount = 0)
    AND (status <> 'partially_refunded'
      OR (refunded_amount > 0 AND refunded_amount < paid_amount))
    AND (status <> 'refunded'
      OR (paid_amount > 0 AND refunded_amount = paid_amount))
  );

CREATE INDEX idx_payments_expiration_claim
  ON payments (status, expires_at, created_at)
  WHERE status IN ('pending', 'submitted') AND expires_at IS NOT NULL;
