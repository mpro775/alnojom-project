const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');
const { GUARDS_METADATA } = require('@nestjs/common/constants');

const {
  AdminPaymentMethodsController,
} = require('../dist/payment-methods/payment-methods.controller');
const {
  LegacyAdminPaymentMethodsCompatibilityController,
} = require('../dist/compatibility/legacy-admin-payment-methods.controller');
const { AdminFulfillmentController } = require('../dist/shipping/shipping.controller');
const {
  LegacyAdminFulfillmentCompatibilityController,
} = require('../dist/compatibility/legacy-admin-fulfillment.controller');
const { EmailService } = require('../dist/email/email.service');
const { MetricsService } = require('../dist/observability/metrics.service');
const {
  listAdminNotificationEvents,
} = require('../dist/notifications/notification-events.registry');

const openapi = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'api', 'openapi.json'), 'utf8'),
);

describe('canonical Admin API and compatibility aliases', () => {
  it('publishes only canonical Admin endpoints in Swagger', () => {
    assert.ok(openapi.paths['/admin/payment-methods']);
    assert.ok(openapi.paths['/admin/payment-methods/available']);
    assert.ok(openapi.paths['/admin/fulfillment']);
    assert.equal(Object.keys(openapi.paths).some((route) => route.startsWith('/merchant/')), false);
    assert.equal(openapi.info.title, 'Alnjoom Telecom Store API');
  });

  it('delegates canonical and legacy payment endpoints to the same service method', async () => {
    const calls = [];
    const service = {
      async listAvailableForAdmin() {
        calls.push('available');
        return [{ id: 'catalog-1' }];
      },
    };
    const canonical = new AdminPaymentMethodsController(service);
    const legacy = new LegacyAdminPaymentMethodsCompatibilityController(service);

    assert.deepEqual(await canonical.available(), await legacy.available());
    assert.deepEqual(calls, ['available', 'available']);
    assert.deepEqual(guardNames(canonical.constructor), guardNames(legacy.constructor));
  });

  it('delegates canonical and legacy fulfillment endpoints to the same service method', async () => {
    const calls = [];
    const service = {
      async getFulfillmentSettings(user) {
        calls.push(user.id);
        return { ready: true };
      },
    };
    const user = { id: 'admin-1' };
    const canonical = new AdminFulfillmentController(service);
    const legacy = new LegacyAdminFulfillmentCompatibilityController(service);

    assert.deepEqual(await canonical.getSettings(user), await legacy.getSettings(user));
    assert.deepEqual(calls, ['admin-1', 'admin-1']);
    assert.deepEqual(guardNames(canonical.constructor), guardNames(legacy.constructor));
  });
});

describe('Alnjoom runtime branding contracts', () => {
  it('publishes the canonical metrics prefix and the documented compatibility info metric', async () => {
    const config = {
      get(key, fallback) {
        if (key === 'METRICS_PREFIX') return 'alnjoom_';
        return fallback;
      },
    };
    const metrics = await new MetricsService(config).getMetrics();

    assert.match(metrics, /^# HELP alnjoom_info Application info/mu);
    assert.match(metrics, /^ecommerce_core_info\{version="1\.0\.0"\} 1$/mu);
  });

  it('migrates the support source forward without rewriting migration history', () => {
    const up = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', '109_migrate_support_source_to_admin_portal.up.sql'),
      'utf8',
    );
    const down = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', '109_migrate_support_source_to_admin_portal.down.sql'),
      'utf8',
    );

    assert.match(up, /SET source = 'admin_portal'\s+WHERE source = 'merchant_portal'/u);
    assert.match(up, /CHECK \(source IN \('admin_portal', 'customer_portal', 'system'\)\)/u);
    assert.match(down, /SET source = 'merchant_portal'\s+WHERE source = 'admin_portal'/u);
  });

  it('uses canonical notification deep links while leaving event IDs unchanged', () => {
    const definitions = listAdminNotificationEvents();
    assert.ok(definitions.length > 0);
    for (const definition of definitions) {
      if (!definition.actionUrl) continue;
      if (definition.recipientType === 'store' || definition.recipientType === 'store_user') {
        assert.match(definition.actionUrl, /^\/admin(?:\?|$)/u);
      }
      assert.doesNotMatch(definition.actionUrl, /^\/merchant(?:\?|$)/u);
    }
    assert.ok(definitions.some((definition) => definition.eventType === 'order.created'));
  });

  it('renders Alnjoom branding in staff invitation email without changing its URL', async () => {
    const config = {
      get(key, fallback) {
        if (key === 'EMAIL_DELIVERY_MODE') return 'smtp';
        if (key === 'EMAIL_FROM') return 'no-reply@alnjoom.invalid';
        return fallback;
      },
    };
    const service = new EmailService(config);
    let delivered;
    service.sendWithSmtp = async (input) => {
      delivered = input;
    };
    const inviteUrl = 'https://admin.example/accept-invite?token=unchanged-token';

    await service.sendStaffInvite({
      to: 'admin@example.com',
      fullName: 'Admin User',
      storeName: 'نجوم تليكوم',
      inviteUrl,
      expiresAt: new Date('2026-08-03T00:00:00.000Z'),
    });

    assert.match(delivered.text, /Alnjoom Telecom Store/u);
    assert.match(delivered.html, /Alnjoom Telecom Store/u);
    assert.ok(delivered.text.includes(inviteUrl));
  });
});

function guardNames(controller) {
  return (Reflect.getMetadata(GUARDS_METADATA, controller) ?? []).map((guard) => guard.name);
}
