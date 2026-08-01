DO $$
DECLARE
  incompatible_count integer;
BEGIN
  SELECT COUNT(*) INTO incompatible_count
  FROM payments
  WHERE status IN ('submitted', 'expired', 'cancelled', 'partially_refunded');
  IF incompatible_count > 0 THEN
    RAISE EXCEPTION 'Migration 100 rollback blocked: % payment rows cannot be represented by the legacy contract', incompatible_count;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_payments_expiration_claim;
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_status_financial_check,
  DROP CONSTRAINT IF EXISTS payments_financial_projection_check,
  DROP CONSTRAINT IF EXISTS payments_status_check;
UPDATE payments SET status = 'refunded' WHERE status = 'refunded';
ALTER TABLE payments
  ADD CONSTRAINT payments_status_check
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'refunded')),
  DROP COLUMN collection_reference,
  DROP COLUMN collected_at,
  DROP COLUMN expires_at,
  DROP COLUMN review_started_at,
  DROP COLUMN submission_version,
  DROP COLUMN version,
  DROP COLUMN currency_code,
  DROP COLUMN refunded_amount,
  DROP COLUMN paid_amount;

DROP INDEX IF EXISTS idx_orders_store_lifecycle;
ALTER TABLE orders
  ALTER COLUMN fulfillment_status SET DEFAULT 'not_started',
  DROP CONSTRAINT IF EXISTS orders_commercial_money_check,
  DROP CONSTRAINT IF EXISTS orders_terminal_fulfillment_check,
  DROP CONSTRAINT IF EXISTS orders_fulfillment_type_check,
  DROP CONSTRAINT IF EXISTS orders_fulfillment_status_check,
  DROP CONSTRAINT IF EXISTS orders_status_check;

UPDATE orders
SET status = CASE
      WHEN legacy_returned_at IS NOT NULL THEN 'returned'
      WHEN status = 'confirmed' AND fulfillment_status = 'preparing' THEN 'preparing'
      WHEN status = 'confirmed' AND fulfillment_status = 'out_for_delivery' THEN 'out_for_delivery'
      ELSE status
    END,
    fulfillment_status = CASE
      WHEN fulfillment_status = 'unfulfilled' THEN 'not_started'
      WHEN fulfillment_status = 'ready' THEN 'ready_for_pickup'
      WHEN fulfillment_status = 'fulfilled' AND fulfillment_type = 'pickup' THEN 'picked_up'
      WHEN fulfillment_status = 'fulfilled' THEN 'delivered'
      WHEN fulfillment_status = 'cancelled' THEN 'not_started'
      ELSE fulfillment_status
    END;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check CHECK (status IN (
    'new', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled', 'returned'
  )),
  ADD CONSTRAINT orders_fulfillment_status_check CHECK (fulfillment_status IN (
    'not_started', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'picked_up', 'failed'
  )),
  ADD CONSTRAINT orders_fulfillment_type_check CHECK (fulfillment_type IN (
    'delivery', 'pickup', 'external_shipping', 'manual_coordination'
  )),
  ALTER COLUMN fulfillment_type DROP NOT NULL,
  DROP COLUMN refunded_amount,
  DROP COLUMN paid_amount,
  DROP COLUMN tax_amount,
  DROP COLUMN cancelled_at,
  DROP COLUMN completed_at,
  DROP COLUMN confirmed_at,
  DROP COLUMN legacy_return_note,
  DROP COLUMN legacy_returned_at,
  DROP COLUMN version;
