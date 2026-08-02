import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const publicPages = ['/', '/login'];
const adminTabs = [
  { name: 'products' },
  { name: 'orders' },
  { name: 'store' },
];

const testSession = {
  apiBaseUrl: 'http://localhost:3000',
  accessToken: 'a11y-access-token',
  refreshToken: 'a11y-refresh-token',
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    storeId: '00000000-0000-0000-0000-000000000010',
    email: 'admin-a11y@example.com',
    fullName: 'Admin A11y',
    role: 'owner',
    permissions: ['*'],
    sessionId: 'a11y-session',
  },
};

async function installAdminSession(page) {
  await page.addInitScript((session) => {
    window.localStorage.setItem('alnjoom.admin.session.v1', JSON.stringify(session));
    window.localStorage.setItem('alnjoom.admin.apiBaseUrl.v1', session.apiBaseUrl);
  }, testSession);

  await page.route('**/*', (route) => {
    if (route.request().url().startsWith(testSession.apiBaseUrl)) {
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Endpoint intentionally unavailable in accessibility test.' }),
      });
    }
    return route.continue();
  });
  await page.route('**/socket.io/**', (route) => route.abort());
  await page.route('**/store/settings', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        id: testSession.user.storeId,
        name: 'A11y Test Store',
        slug: 'a11y-test-store',
        phone: null,
        address: null,
        country: 'SA',
        city: null,
        addressDetails: null,
        latitude: null,
        longitude: null,
        workingHours: [],
        socialLinks: {},
        currencyCode: 'SAR',
        timezone: 'Asia/Riyadh',
      }),
    }),
  );
  await page.route('**/me/accessibility-preferences', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        highContrast: false,
        reducedMotion: false,
        fontScale: '100',
        underlineLinks: false,
        strongFocusRing: true,
      }),
    }),
  );
}

async function expectNoBlockingAxeViolations(page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  const blocking = results.violations.filter((violation) =>
    violation.impact === 'critical' || violation.impact === 'serious',
  );
  expect(blocking).toEqual([]);
}

for (const pagePath of publicPages) {
  test(`Alnjoom Admin ${pagePath} has no critical or serious accessibility violations`, async ({ page }) => {
    await page.goto(pagePath);
    await expectNoBlockingAxeViolations(page);
  });
}

test.describe('admin authenticated workspace accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await installAdminSession(page);
  });

  test('admin shell and primary tabs have no critical or serious accessibility violations', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/admin');
    await expectNoBlockingAxeViolations(page);

    for (const tab of adminTabs) {
      await page.goto(`/admin?tab=${tab.name}`);
      await expectNoBlockingAxeViolations(page);
    }
  });

  test('keyboard opens and closes drawer, user menu, and accessibility dialog', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/admin');

    const menuButton = page.getByRole('button', { name: /فتح التنقل|فتح القائمة/i }).first();
    await menuButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('presentation').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menuButton).toBeFocused();

    const userMenuButton = page.getByRole('button', { name: /قائمة|Admin A11y|مستخدم/i }).first();
    await userMenuButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(userMenuButton).toBeFocused();

    await userMenuButton.focus();
    await page.keyboard.press('Enter');
    const a11yButton = page.getByRole('menuitem', { name: /إعدادات الوصول/i });
    await a11yButton.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: /إعدادات الوصول/i });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(dialog).toContainText(/تباين|حجم الخط/i);
    await page.keyboard.press('Escape');
    await expect(userMenuButton).toBeFocused();
  });
});
