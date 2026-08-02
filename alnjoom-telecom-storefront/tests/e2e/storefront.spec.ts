import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "node:path";

test("catalog, search, generic variants, cart and bilingual layout", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "تقنية موثوقة، مختارة لك." })).toBeVisible();
  await expect(page.getByAltText("النجوم تيليكوم | Alnjoom Telecom")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("arabic-desktop.png"), fullPage: true });

  await page.getByRole("link", { name: "جوالات", exact: true }).first().click();
  await expect(page).toHaveURL(/category\/phones/);
  await expect(page.getByRole("heading", { name: "هاتف النجوم برو" }).first()).toBeVisible();

  await page.goto("/search?q=هاتف");
  await expect(page.getByText("هاتف النجوم برو").first()).toBeVisible();
  await page.getByRole("link", { name: "هاتف النجوم برو" }).first().click();
  await page.getByRole("button", { name: "ذهبي / Gold" }).click();
  await page.getByRole("button", { name: "256 GB" }).click();
  await expect(page.getByText(/140/).first()).toBeVisible();
  await page.getByRole("button", { name: "أضف إلى السلة" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("link", { name: "عرض السلة" }).click();
  await expect(page.getByRole("heading", { name: "سلة التسوق" })).toBeVisible();
  await page.getByRole("button", { name: "زيادة الكمية" }).last().click();
  await expect(page.getByText("2", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "حذف" }).click();
  await expect(page.getByText("سلة التسوق فارغة")).toBeVisible();

  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { name: "Trusted technology, selected for you." })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("english-mobile.png"), fullPage: true });
  await expectNoOverflow(page);
});

test("guest checkout uses server quote and reuses idempotency key after lost response", async ({ page }) => {
  await addDefaultProduct(page);
  await page.goto("/checkout");
  await page.getByLabel("الاسم").fill("عميل زائر");
  await page.getByLabel("الهاتف").fill("0500000000");
  await page.getByLabel("العنوان").fill("حي الاختبار");
  await page.getByLabel("المدينة").fill("الرياض");
  await page.getByText("توصيل قياسي").click();
  await page.getByText("الدفع عند الاستلام").click();
  await page.getByPlaceholder("رمز القسيمة").fill("STAR10");
  await page.getByRole("button", { name: "تطبيق" }).click();
  await expect(page.getByText("خصم العروض")).toBeVisible();

  const keys: string[] = [];
  let first = true;
  await page.route("**/api/storefront/checkout", async (route) => {
    keys.push(route.request().headers()["idempotency-key"] ?? "");
    if (first) {
      first = false;
      await route.fetch();
      await route.abort("failed");
    } else await route.continue();
  });
  await page.getByRole("button", { name: "تأكيد وإنشاء الطلب" }).click();
  await expect(page.getByText(/تعذّر الاتصال/)).toBeVisible();
  await page.getByRole("button", { name: "تأكيد وإنشاء الطلب" }).click();
  await expect(page.getByText("MOCK-1001")).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
  await page.getByRole("link", { name: "تتبع الطلب" }).click();
  await expect(page.getByText("قيد التجهيز").first()).toBeVisible();
});

test("authenticated customer flows and receipt upload", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("الهاتف أو البريد").fill("customer@example.com");
  await page.getByLabel("كلمة المرور").fill("password123");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page.getByText(/مرحبًا عميل الاختبار/)).toBeVisible();

  await page.goto("/product/alnjoom-pro-phone");
  await page.getByRole("button", { name: "إضافة إلى المفضلة" }).click();
  await page.getByLabel("التقييم").selectOption("5");
  await page.getByLabel("تعليقك").fill("تقييم من الاختبار");
  await page.getByRole("button", { name: "إرسال التقييم" }).click();
  await page.getByPlaceholder("اكتب سؤالك عن المنتج").fill("هل يتوفر قريبًا؟");
  await page.getByRole("button", { name: "إرسال السؤال" }).click();

  await page.goto("/product/unavailable-headset");
  await page.getByRole("button", { name: "أبلغني عند التوفر" }).click();
  await expect(page.getByText("سنبلغك عند توفر المنتج")).toBeVisible();

  await page.goto("/account/wishlist");
  await expect(page.getByText("هاتف النجوم برو")).toBeVisible();
  await page.goto("/account/loyalty");
  await expect(page.getByText("500", { exact: true })).toBeVisible();
  await page.goto("/account/notifications");
  await page.getByRole("button", { name: /تم تحديث الطلب/ }).click();
  await page.goto("/account/support/new");
  await page.getByLabel("الموضوع").fill("تذكرة E2E");
  await page.getByLabel("الرسالة").fill("رسالة اختبار");
  await page.getByRole("button", { name: "إنشاء التذكرة" }).click();
  await expect(page.getByRole("heading", { name: "تذكرة E2E" })).toBeVisible();
  await page.getByRole("textbox").last().fill("رد جديد");
  await page.getByRole("button", { name: "إرسال" }).click();
  await expect(page.getByText("رد جديد")).toBeVisible();

  await addDefaultProduct(page);
  await page.goto("/checkout");
  await page.getByText("توصيل قياسي").click();
  await page.getByText("تحويل بنكي").click();
  await page.getByLabel("مرجع العملية").fill("REF-100");
  await page.locator('input[type="file"]').setInputFiles(path.resolve("public/alnjoom-logo.png"));
  await expect(page.getByText("الإيصال جاهز")).toBeVisible();
});

test("OTP, accessibility and responsive commerce viewports", async ({ page }, testInfo) => {
  await page.goto("/otp");
  await page.getByLabel("الهاتف أو البريد").fill("customer@example.com");
  await page.getByRole("button", { name: "إرسال الرمز" }).click();
  await page.getByLabel("رمز التحقق").fill("1234");
  await page.getByRole("button", { name: "الدخول برمز تحقق" }).click();
  await expect(page.getByText(/مرحبًا عميل الاختبار/)).toBeVisible();

  await page.goto("/");
  const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
  expect(results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""))).toEqual([]);
  for (const width of [360, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoOverflow(page);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: testInfo.outputPath("arabic-1440.png"), fullPage: true });
});

async function addDefaultProduct(page: import("@playwright/test").Page) {
  await page.goto("/product/alnjoom-pro-phone");
  await page.getByRole("button", { name: "أضف إلى السلة" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
}

async function expectNoOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
