import { expect, test } from '@playwright/test';

const session = {
  apiBaseUrl: 'http://localhost:3000',
  accessToken: 'route-access-token',
  refreshToken: 'route-refresh-token',
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    storeId: '00000000-0000-0000-0000-000000000010',
    email: 'admin-route@example.com',
    fullName: 'Admin Route',
    role: 'owner',
    permissions: ['*'],
    sessionId: 'route-session',
  },
};

async function installSession(page) {
  await page.addInitScript((value) => {
    window.localStorage.setItem('alnjoom.admin.session.v1', JSON.stringify(value));
    window.localStorage.setItem('alnjoom.admin.apiBaseUrl.v1', value.apiBaseUrl);
  }, session);
}

async function mockAdminApi(page) {
  await page.route('**/socket.io/**', (route) => route.abort());
  await page.route('http://localhost:3000/**', (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.startsWith('/analytics/')) {
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Analytics intentionally unavailable in route test.' }),
      });
    }
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ items: [], total: 0 }),
    });
  });
}

test('/admin renders the authenticated Admin dashboard', async ({ page }) => {
  await installSession(page);
  await mockAdminApi(page);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin(?:\?tab=overview)?$/u);
  await expect(page.getByText(/لوحة إدارة نجوم تليكوم/u).first()).toBeVisible();
});

test('unauthenticated /admin follows current login behavior', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/u);
  await expect(page.getByLabel('البريد الإلكتروني')).toBeVisible();
});

for (const legacyUrl of [
  '/merchant',
  '/merchant?tab=orders',
  '/merchant?tab=supportTickets&ticketId=123',
]) {
  test(`${legacyUrl} is replaced by its canonical Admin deep link`, async ({ page }) => {
    await installSession(page);
    await mockAdminApi(page);
    await page.goto(legacyUrl);
    const canonicalUrl = legacyUrl === '/merchant' ? /\/admin(?:\?tab=overview)?$/u : legacyUrl.replace('/merchant', '/admin');
    await expect(page).toHaveURL(canonicalUrl);
  });
}

test('successful login navigates to /admin', async ({ page }) => {
  await page.route('http://localhost:3000/health/live', (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'x-csrf-token': 'route-csrf-token' },
      body: JSON.stringify({ status: 'ok' }),
    }),
  );
  await page.route('http://localhost:3000/auth/login', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
      }),
    }),
  );
  await page.goto('/login');
  await page.getByLabel('البريد الإلكتروني').fill(session.user.email);
  await page.getByRole('textbox', { name: 'كلمة المرور', exact: true }).fill('valid-password');
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click();
  await expect(page).toHaveURL(/\/admin(?:\?tab=overview)?$/u);
});

test('accepting a valid invitation signs in and navigates to /admin', async ({ page }) => {
  await mockAdminApi(page);
  await page.route('http://localhost:3000/auth/invite/validate', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        valid: true,
        email: session.user.email,
        fullName: session.user.fullName,
        storeName: 'Alnjoom Telecom Store',
      }),
    }),
  );
  await page.route('http://localhost:3000/auth/invite/accept', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(session.user) }),
  );
  await page.route('http://localhost:3000/auth/login', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
      }),
    }),
  );

  await page.goto('/accept-invite?token=valid-unchanged-token');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('valid-password');
  await page.getByRole('textbox', { name: 'Confirm password', exact: true }).fill('valid-password');
  await page.getByRole('button', { name: 'Accept invitation' }).click();

  await expect(page).toHaveURL(/\/admin(?:\?tab=overview)?$/u);
});
