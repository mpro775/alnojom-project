ALTER TABLE support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_source_check;

ALTER TABLE support_tickets
  ADD CONSTRAINT support_tickets_source_check
  CHECK (source IN ('merchant_portal', 'admin_portal', 'customer_portal', 'system'));

UPDATE support_tickets
SET source = 'merchant_portal'
WHERE source = 'admin_portal';

ALTER TABLE support_tickets
  DROP CONSTRAINT support_tickets_source_check;

ALTER TABLE support_tickets
  ADD CONSTRAINT support_tickets_source_check
  CHECK (source IN ('merchant_portal', 'customer_portal', 'system'));
