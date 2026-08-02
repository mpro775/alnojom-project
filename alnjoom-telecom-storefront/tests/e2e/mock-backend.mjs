import http from "node:http";

const ids = {
  store: "00000000-0000-4000-8000-000000000001",
  category: "10000000-0000-4000-8000-000000000001",
  product: "20000000-0000-4000-8000-000000000001",
  productOut: "20000000-0000-4000-8000-000000000002",
  variant: "30000000-0000-4000-8000-000000000001",
  variantOut: "30000000-0000-4000-8000-000000000002",
  variantGold: "30000000-0000-4000-8000-000000000003",
  variantOnlyOut: "30000000-0000-4000-8000-000000000004",
  cart: "40000000-0000-4000-8000-000000000001",
  customer: "50000000-0000-4000-8000-000000000001",
  address: "60000000-0000-4000-8000-000000000001",
  zone: "70000000-0000-4000-8000-000000000001",
  pickup: "71000000-0000-4000-8000-000000000001",
  delivery: "71000000-0000-4000-8000-000000000002",
  cod: "80000000-0000-4000-8000-000000000001",
  bank: "80000000-0000-4000-8000-000000000002",
  review: "90000000-0000-4000-8000-000000000001",
  notification: "a0000000-0000-4000-8000-000000000001",
  ticket: "b0000000-0000-4000-8000-000000000001",
  media: "c0000000-0000-4000-8000-000000000001",
};

const baseProduct = {
  id: ids.product, productType: "single", isVisible: true, stockUnlimited: false, questionsEnabled: true,
  title: "هاتف النجوم برو", titleAr: "هاتف النجوم برو", titleEn: "Alnjoom Pro Phone", slug: "alnjoom-pro-phone",
  description: "هاتف تقني للاختبار التعاقدي.", descriptionAr: "هاتف تقني للاختبار التعاقدي.", descriptionEn: "A contract-test technology phone.",
  shortDescriptionAr: "أداء واضح وتجربة سريعة.", shortDescriptionEn: "Clear performance and a fast experience.", detailedDescriptionAr: "مواصفات المنتج مقدمة من عقد الاختبار.", detailedDescriptionEn: "Specifications supplied by the test contract.",
  categoryId: ids.category, primaryImageUrl: null, priceFrom: 100, priceFromYER: 100, brand: "Alnjoom Test", weight: 0.2, weightUnit: "kg", dimensions: null,
  productLabel: "مختار", youtubeUrl: null, seoTitle: null, seoDescription: null, seoTitleAr: "هاتف النجوم برو", seoTitleEn: "Alnjoom Pro Phone", seoDescriptionAr: "هاتف اختبار", seoDescriptionEn: "Test phone", tags: [], isFeatured: true, isTaxable: true, taxRate: 15, minOrderQuantity: 1, maxOrderQuantity: 5, ratingAvg: 5, ratingCount: 1,
};

const outProduct = { ...baseProduct, id: ids.productOut, title: "سماعة غير متوفرة", titleAr: "سماعة غير متوفرة", titleEn: "Unavailable Headset", slug: "unavailable-headset", priceFrom: 80, priceFromYER: 80, productLabel: null, isFeatured: false, ratingAvg: 0, ratingCount: 0 };
const products = [baseProduct, outProduct];
const details = {
  ...baseProduct,
  variants: [
    { id: ids.variant, title: "أسود 128", titleAr: "أسود 128", titleEn: "Black 128", sku: "PHONE-B128", price: 100, priceYER: 100, compareAtPrice: 120, compareAtPriceYER: 120, stockQuantity: 5, isDefault: true, attributes: { "اللون / Color": "أسود / Black", "السعة / Storage": "128 GB" } },
    { id: ids.variantOut, title: "أسود 256", titleAr: "أسود 256", titleEn: "Black 256", sku: "PHONE-B256", price: 130, priceYER: 130, compareAtPrice: null, compareAtPriceYER: null, stockQuantity: 0, isDefault: false, attributes: { "اللون / Color": "أسود / Black", "السعة / Storage": "256 GB" } },
    { id: ids.variantGold, title: "ذهبي 256", titleAr: "ذهبي 256", titleEn: "Gold 256", sku: "PHONE-G256", price: 140, priceYER: 140, compareAtPrice: 160, compareAtPriceYER: 160, stockQuantity: 3, isDefault: false, attributes: { "اللون / Color": "ذهبي / Gold", "السعة / Storage": "256 GB" } },
  ],
  images: [],
};
const outDetails = { ...outProduct, variants: [{ id: ids.variantOnlyOut, title: "افتراضي", titleAr: "افتراضي", titleEn: "Default", sku: "HEADSET-OOS", price: 80, priceYER: 80, compareAtPrice: null, compareAtPriceYER: null, stockQuantity: 0, isDefault: true, attributes: {} }], images: [] };

let cartItems = [];
let wishlist = [];
let reviews = [{ id: ids.review, productId: ids.product, productTitle: baseProduct.title, customerId: ids.customer, customerName: "عميل موثّق", rating: 5, comment: "منتج ممتاز", isVerifiedPurchase: true, moderationStatus: "APPROVED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
let notifications = [{ id: ids.notification, type: "order.updated", category: "orders", severity: "info", title: "تم تحديث الطلب", body: "طلبك قيد التجهيز", status: "unread", readAt: null, actionUrl: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
let tickets = [{ id: ids.ticket, storeId: ids.store, scope: "b2c", source: "storefront", subject: "مساعدة في الطلب", description: null, status: "open", priority: "normal", requester: { type: "customer", customerId: ids.customer, storeUserId: null, label: "عميل", name: "عميل" }, assignee: { type: null, storeUserId: null, label: null, name: null }, sla: { firstResponseDueAt: null, resolveDueAt: null, firstResponseAt: null }, resolvedAt: null, closedAt: null, lastMessageAt: null, metadata: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
let messages = [{ id: "d0000000-0000-4000-8000-000000000001", authorType: "customer", authorLabel: "عميل", message: "أحتاج مساعدة", isInternal: false, createdAt: new Date().toISOString() }];
const attempts = new Map();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1:4010");
  if (req.method === "OPTIONS") return send(res, 204, null, cors());
  if (url.pathname === "/health" || url.pathname === "/") return send(res, 200, { status: "ok" });
  if (url.pathname.startsWith("/upload/") && req.method === "PUT") { await readBody(req); return send(res, 200, null, { ...cors(), ETag: '"mock-etag"' }); }

  if (url.pathname === "/app/config") return send(res, 200, config(url.searchParams.get("currencyCode") ?? "SAR"));
  if (url.pathname === "/app/store") return send(res, 200, { id: ids.store, name: "النجوم تيليكوم", slug: "alnjoom", currencyCode: "SAR" });
  if (url.pathname === "/app/categories") return send(res, 200, [{ id: ids.category, name: "جوالات", nameAr: "جوالات", nameEn: "Phones", slug: "phones", description: "هواتف", descriptionAr: "هواتف مختارة", descriptionEn: "Selected phones", imageUrl: null, imageAltAr: null, imageAltEn: null, backgroundImageUrl: null, seoTitleAr: "جوالات", seoTitleEn: "Phones", seoDescriptionAr: "هواتف", seoDescriptionEn: "Phones", parentId: null }]);
  if (url.pathname === "/app/filters") return send(res, 200, [{ id: "f0000000-0000-4000-8000-000000000001", slug: "brand", nameAr: "العلامة", nameEn: "Brand", sourceType: "brand", type: "select", displayType: "checkbox", sourceAttributeId: null, values: [{ id: "f1000000-0000-4000-8000-000000000001", labelAr: "النجوم", labelEn: "Alnjoom", slug: "alnjoom", count: 2 }] }]);
  if (url.pathname === "/app/products") {
    let list = products;
    const q = url.searchParams.get("q")?.toLowerCase();
    if (q) list = list.filter((item) => `${item.title} ${item.titleEn}`.toLowerCase().includes(q));
    if (url.searchParams.get("isFeatured") === "true") list = list.filter((item) => item.isFeatured);
    const requestedIds = url.searchParams.getAll("ids");
    if (requestedIds.length) list = list.filter((item) => requestedIds.includes(item.id));
    return send(res, 200, { items: list, total: list.length, page: 1, limit: Number(url.searchParams.get("limit") ?? 20) });
  }
  if (url.pathname === "/app/products/alnjoom-pro-phone") return send(res, 200, details);
  if (url.pathname === "/app/products/unavailable-headset") return send(res, 200, outDetails);
  if (url.pathname === `/customers/products/${ids.product}/reviews` && req.method === "GET") return send(res, 200, { reviews: reviews.filter((item) => item.moderationStatus === "APPROVED"), stats: { averageRating: 5, totalReviews: 1, ratingDistribution: [{ rating: 5, count: 1 }] } });
  if (url.pathname.match(/^\/customers\/products\/.+\/questions$/) && req.method === "GET") return send(res, 200, { items: [{ id: "e0000000-0000-4000-8000-000000000001", productId: ids.product, productTitle: baseProduct.title, customerId: null, customerName: "عميل", question: "هل يوجد ضمان؟", answer: "تظهر التفاصيل المعتمدة مع المنتج.", answeredBy: null, answeredByName: null, answeredAt: new Date().toISOString(), moderationStatus: "APPROVED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }], total: 1 });

  if (url.pathname === "/app/cart/items" && req.method === "POST") { const body = await jsonBody(req); const variant = [details, outDetails].flatMap((item) => item.variants).find((item) => item.id === body.variantId); if (!variant) return send(res, 404, { message: "Variant not found" }); const existing = cartItems.find((item) => item.variantId === variant.id); if (existing) existing.quantity += body.quantity; else cartItems.push({ productId: variant.id === ids.variantOnlyOut ? ids.productOut : ids.product, variantId: variant.id, title: variant.title, sku: variant.sku, quantity: body.quantity, unitPrice: variant.price, unitPriceYER: variant.price, lineTotal: variant.price * body.quantity, lineTotalYER: variant.price * body.quantity }); return send(res, 200, cart()); }
  if (url.pathname === `/app/cart/${ids.cart}` && req.method === "GET") return send(res, 200, cart());
  if (url.pathname.match(new RegExp(`^/app/cart/${ids.cart}/items/.+$`)) && req.method === "PUT") { const body = await jsonBody(req); const variantId = url.pathname.split("/").at(-1); const item = cartItems.find((value) => value.variantId === variantId); if (item) { if (body.quantity === 0) cartItems = cartItems.filter((value) => value !== item); else { item.quantity = body.quantity; item.lineTotal = item.unitPrice * item.quantity; item.lineTotalYER = item.lineTotal; } } return send(res, 200, cart()); }
  if (url.pathname.match(new RegExp(`^/app/cart/${ids.cart}/items/.+$`)) && req.method === "DELETE") { const variantId = url.pathname.split("/").at(-1); cartItems = cartItems.filter((item) => item.variantId !== variantId); return send(res, 200, cart()); }

  if (url.pathname === "/app/fulfillment-options") return send(res, 200, fulfillment());
  if (url.pathname === "/app/shipping-zones") return send(res, 200, fulfillment().deliveryZones.map((zone) => ({ id: zone.id, name: zone.name, city: zone.city, area: zone.area, description: zone.description, fee: zone.fee })));
  if (url.pathname === "/app/payment-methods") return send(res, 200, paymentMethods());
  if (url.pathname === "/app/checkout/quote" || url.pathname === "/app/checkout/summary") { const body = await jsonBody(req); const subtotal = cart().subtotal; const shippingFee = body.fulfillmentMethodId === ids.pickup ? 0 : 20; const promotionDiscount = body.couponCode === "STAR10" ? 10 : 0; const pointsDiscount = body.pointsToRedeem > 0 ? 5 : 0; return send(res, 200, { subtotal, shippingFee, availableShippingMethods: fulfillment().deliveryZones[0].methods, selectedShippingMethodId: body.fulfillmentMethodId ?? null, promotionDiscount, pointsDiscount, total: subtotal + shippingFee - promotionDiscount - pointsDiscount, currencyCode: "SAR", exchangeRateYerPerUnit: 1, subtotalYER: subtotal, totalYER: subtotal + shippingFee - promotionDiscount - pointsDiscount, shippingFeeYER: shippingFee, promotionDiscountYER: promotionDiscount, pointsDiscountYER: pointsDiscount, pointsToRedeemApplied: body.pointsToRedeem ?? 0, potentialEarnPoints: 10, availablePoints: 500 }); }
  if (url.pathname === "/app/payment-receipts/presign" && req.method === "POST") { const body = await jsonBody(req); return send(res, 200, { objectKey: `${ids.store}/payment-receipts/${body.fileName}`, uploadUrl: "http://127.0.0.1:4010/upload/receipt", uploadHeaders: { "Content-Type": body.contentType }, expiresAt: new Date(Date.now() + 60_000).toISOString(), maxFileSizeBytes: 5 * 1024 * 1024 }); }
  if (url.pathname === "/app/payment-receipts" && req.method === "POST") return send(res, 200, { id: ids.media, storeId: ids.store, bucketName: "test", objectKey: `${ids.store}/payment-receipts/test.png`, url: "http://127.0.0.1:4010/media/test.png", etag: "mock-etag", mimeType: "image/png", fileSizeBytes: 1024, metadata: {}, createdAt: new Date().toISOString() });
  if (url.pathname === "/app/checkout" && req.method === "POST") { const key = req.headers["idempotency-key"]; if (typeof key !== "string" || key.length < 16) return send(res, 400, { code: "IDEMPOTENCY_KEY_REQUIRED", message: "Idempotency key required" }); const body = await jsonBody(req); if (attempts.has(key)) return send(res, 200, attempts.get(key)); const result = { orderId: "f0000000-0000-4000-8000-000000000001", orderCode: "MOCK-1001", status: "pending", total: cart().subtotal + (body.fulfillmentMethodId === ids.pickup ? 0 : 20) - (body.couponCode === "STAR10" ? 10 : 0) - (body.pointsToRedeem ? 5 : 0), currencyCode: "SAR", exchangeRateYerPerUnit: 1, subtotalYER: cart().subtotal, totalYER: cart().subtotal + 10, shippingFeeYER: 20, discountTotalYER: 10, shippingFee: body.fulfillmentMethodId === ids.pickup ? 0 : 20, discountTotal: (body.couponCode === "STAR10" ? 10 : 0) + (body.pointsToRedeem ? 5 : 0), pointsRedeemed: body.pointsToRedeem ?? 0, pointsDiscountAmount: body.pointsToRedeem ? 5 : 0, pointsDiscountAmountYER: body.pointsToRedeem ? 5 : 0, pointsEarned: 10 }; attempts.set(key, result); return send(res, 200, result); }
  if (url.pathname === "/app/events" && req.method === "POST") return send(res, 202, { accepted: true });
  if (url.pathname === "/app/orders/MOCK-1001/track") return send(res, 200, { orderCode: "MOCK-1001", status: "processing", total: 110, currencyCode: "SAR", timeline: [{ status: "pending", note: null, createdAt: new Date(Date.now() - 3600000).toISOString() }, { status: "processing", note: "قيد التجهيز", createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() });

  if (["/customers/login", "/customers/register", "/customers/otp/verify", "/customers/refresh"].includes(url.pathname) && req.method === "POST") return send(res, 200, session());
  if (["/customers/forgot-password", "/customers/reset-password", "/customers/otp/request", "/customers/otp/resend"].includes(url.pathname) && req.method === "POST") return send(res, 204, null);
  if (url.pathname === "/customers/logout" && req.method === "POST") return send(res, 204, null);
  if (!req.headers.authorization?.startsWith("Bearer ") && url.pathname.startsWith("/customers/")) return send(res, 401, { message: "Unauthorized" });
  if (url.pathname === "/customers/me" && req.method === "GET") return send(res, 200, session().customer);
  if (url.pathname === "/customers/me" && req.method === "PATCH") return send(res, 200, { ...session().customer, ...(await jsonBody(req)) });
  if (url.pathname === "/customers/me" && req.method === "DELETE") return send(res, 204, null);
  if (url.pathname === "/customers/addresses" && req.method === "GET") return send(res, 200, [{ id: ids.address, addressLine: "حي الاختبار", city: "الرياض", area: "طويق", notes: null, isDefault: true, latitude: null, longitude: null, mapProvider: null, placeLabel: null }]);
  if (url.pathname === "/customers/addresses" && req.method === "POST") return send(res, 200, { id: ids.address, ...(await jsonBody(req)), city: null, area: null, notes: null, isDefault: false, latitude: null, longitude: null, mapProvider: null, placeLabel: null });
  if (url.pathname.startsWith("/customers/addresses/") && req.method === "DELETE") return send(res, 204, null);
  if (url.pathname === "/customers/wishlist" && req.method === "GET") return send(res, 200, wishlist);
  if (url.pathname.match(/^\/customers\/wishlist\/.+\/check$/)) return send(res, 200, { inWishlist: wishlist.length > 0 });
  if (url.pathname.match(/^\/customers\/wishlist\/.+$/) && req.method === "POST") { const productId = url.pathname.split("/").at(-1); const product = products.find((item) => item.id === productId); if (product && !wishlist.some((item) => item.productId === productId)) wishlist.push({ id: "ab000000-0000-4000-8000-000000000001", productId, title: product.title, slug: product.slug, primaryImageUrl: product.primaryImageUrl, priceFrom: product.priceFrom, createdAt: new Date().toISOString() }); return send(res, 200, wishlist.at(-1)); }
  if (url.pathname.match(/^\/customers\/wishlist\/.+$/) && req.method === "DELETE") { const productId = url.pathname.split("/").at(-1); wishlist = wishlist.filter((item) => item.productId !== productId); return send(res, 204, null); }
  if (url.pathname === "/customers/reviews" && req.method === "GET") return send(res, 200, reviews);
  if (url.pathname === "/customers/reviews" && req.method === "POST") { const body = await jsonBody(req); const review = { id: "90000000-0000-4000-8000-000000000002", productId: body.productId, productTitle: baseProduct.title, customerId: ids.customer, customerName: "عميل الاختبار", rating: body.rating, comment: body.comment ?? null, isVerifiedPurchase: true, moderationStatus: "PENDING", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; reviews.push(review); return send(res, 200, review); }
  if (url.pathname.startsWith("/customers/reviews/") && req.method === "DELETE") { reviews = reviews.filter((item) => item.id !== url.pathname.split("/").at(-1)); return send(res, 204, null); }
  if (url.pathname.match(/^\/customers\/products\/.+\/questions$/) && req.method === "POST") return send(res, 200, { id: "e0000000-0000-4000-8000-000000000002", moderationStatus: "PENDING", ...(await jsonBody(req)) });
  if (url.pathname.match(/^\/customers\/products\/.+\/restock-subscriptions$/) && req.method === "POST") return send(res, 200, { subscriptionId: "ee000000-0000-4000-8000-000000000001", message: "Subscribed" });
  if (url.pathname === "/customers/orders") return send(res, 200, { orders: [{ id: "f0000000-0000-4000-8000-000000000001", orderCode: "MOCK-1001", status: "processing", subtotal: 100, total: 110, shippingFee: 20, discountTotal: 10, currencyCode: "SAR", createdAt: new Date().toISOString() }], total: 1 });
  if (url.pathname === "/customers/loyalty/wallet") return send(res, 200, { customerId: ids.customer, availablePoints: 500, lockedPoints: 0, lifetimeEarnedPoints: 800, lifetimeRedeemedPoints: 300 });
  if (url.pathname === "/customers/loyalty/ledger") return send(res, 200, [{ id: "fa000000-0000-4000-8000-000000000001", customerId: ids.customer, orderId: null, entryType: "earn", pointsDelta: 100, amountDelta: 0, balanceAfter: 500, referenceEntryId: null, reason: "Order", metadata: {}, createdByStoreUserId: null, createdAt: new Date().toISOString() }]);
  if (url.pathname === "/customers/notifications/inbox") return send(res, 200, { items: notifications, total: notifications.length, page: 1, limit: 20 });
  if (url.pathname === "/customers/notifications/unread-count") return send(res, 200, { count: notifications.filter((item) => item.status === "unread").length });
  if (url.pathname.match(/^\/customers\/notifications\/.+\/read$/) && req.method === "PATCH") { notifications = notifications.map((item) => ({ ...item, status: "read", readAt: new Date().toISOString() })); return send(res, 200, { ok: true }); }
  if (url.pathname === "/customers/notifications/read-all" && req.method === "PATCH") { notifications = notifications.map((item) => ({ ...item, status: "read", readAt: new Date().toISOString() })); return send(res, 200, { updated: notifications.length }); }
  if (url.pathname === "/customers/support/tickets" && req.method === "GET") return send(res, 200, { items: tickets, total: tickets.length, page: 1, limit: 20 });
  if (url.pathname === "/customers/support/tickets" && req.method === "POST") { const body = await jsonBody(req); const ticket = { ...tickets[0], id: "b0000000-0000-4000-8000-000000000002", subject: body.subject, description: body.description ?? null, priority: body.priority, createdAt: new Date().toISOString() }; tickets.push(ticket); return send(res, 200, ticket); }
  if (url.pathname.match(/^\/customers\/support\/tickets\/.+$/) && !url.pathname.endsWith("/messages") && !url.pathname.endsWith("/status") && req.method === "GET") return send(res, 200, { ticket: tickets.find((item) => item.id === url.pathname.split("/").at(-1)) ?? tickets[0], messages, events: [] });
  if (url.pathname.endsWith("/messages") && req.method === "POST") { const body = await jsonBody(req); const message = { id: `d0000000-0000-4000-8000-${String(messages.length + 2).padStart(12, "0")}`, authorType: "customer", authorLabel: "عميل", message: body.message, isInternal: false, createdAt: new Date().toISOString() }; messages.push(message); return send(res, 200, message); }
  if (url.pathname.endsWith("/status") && req.method === "PATCH") { const body = await jsonBody(req); tickets = tickets.map((item) => ({ ...item, status: body.status })); return send(res, 200, tickets[0]); }
  return send(res, 404, { message: `Mock route not found: ${req.method} ${url.pathname}` });
});

server.listen(4010, "127.0.0.1", () => console.log("Mock backend listening on 4010"));

function config(currencyCode) { return { storeId: ids.store, storeSlug: "alnjoom", storeSettings: { id: ids.store, name: "النجوم تيليكوم", nameAr: "النجوم تيليكوم", nameEn: "Alnjoom Telecom", descriptionAr: "متجر تقنية للاختبارات التعاقدية.", descriptionEn: "A contract-test technology store.", description: "النجوم تيليكوم", slug: "alnjoom", phone: "+966500000000", address: "حي طويق", country: "السعودية", city: "الرياض", addressDetails: null, latitude: 24.6, longitude: 46.6, workingHours: [{ day: "sunday", isClosed: false, slots: [{ open: "09:00", close: "22:00" }] }], socialLinks: {}, currencyCode, baseCurrencyCode: "YER", defaultCurrencyCode: "SAR", currencies: [{ currencyCode: "SAR", yerPerUnit: 1, decimalDigits: 2, roundingIncrement: 0.01, isDefault: true, isActive: true }], timezone: "Asia/Riyadh", orderSettings: { minimumOrderValue: 0, allowGuestCheckout: true, allowOrderCancellation: true, cancellationWindowMinutes: 30, allowReturns: true, returnWindowDays: 7, confirmationMode: "automatic", stockDeductionTiming: "order_creation", orderNumberPrefix: "MOCK" }, inventorySettings: { allowOutOfStockSales: false, lowStockAlertThreshold: 2, reserveInventory: true, reservationTtlMinutes: 15, warehouseSelectionMode: "priority", warehousePriority: [], restoreStockOnCancellation: true }, taxSettings: { enabled: true, defaultRate: 15, priceMode: "inclusive", exemptions: [], categoryRates: {}, taxNumber: null }, mobileAppConfig: { latestAndroidVersion: null, latestIosVersion: null, minimumAndroidVersion: null, minimumIosVersion: null, forceUpdate: false, maintenanceMode: false, maintenanceMessage: null }, seoSettings: { homeSeoTitleAr: "النجوم تيليكوم", homeSeoTitleEn: "Alnjoom Telecom", homeSeoDescriptionAr: "متجر التقنية", homeSeoDescriptionEn: "Technology store", defaultSeoTitleAr: "النجوم", defaultSeoTitleEn: "Alnjoom", defaultSeoDescriptionAr: "متجر", defaultSeoDescriptionEn: "Store", defaultOgImage: null, defaultTwitterImage: null, keywords: ["تقنية"], googleSiteVerification: null, googleAnalyticsMeasurementId: null, bingSiteVerification: null, facebookDomainVerification: null, seoIndexEnabled: true, seoFollowDefault: true, canonicalBaseUrl: "http://127.0.0.1:3100", defaultLanguage: "ar", supportedLanguages: ["ar", "en"] } } }; }
function fulfillment() { const delivery = { id: ids.delivery, zoneId: ids.zone, type: "delivery", displayName: "توصيل قياسي", description: "2–4 أيام", cost: 20, minDeliveryDays: 2, maxDeliveryDays: 4, isActive: true, sortOrder: 1 }; const pickup = { id: ids.pickup, zoneId: ids.zone, type: "store_pickup", displayName: "استلام من المتجر", description: "جاهز بعد التأكيد", cost: 0, minDeliveryDays: 0, maxDeliveryDays: 0, isActive: true, sortOrder: 0 }; return { hasOptions: true, pickup: [pickup], deliveryZones: [{ id: ids.zone, name: "الرياض", city: "الرياض", area: null, description: "داخل الرياض", fee: 20, methods: [delivery] }] }; }
function paymentMethods() { return [{ id: ids.cod, code: "cod", name: "الدفع عند الاستلام", nameAr: "الدفع عند الاستلام", nameEn: "Cash on delivery", description: "ادفع عند الاستلام", descriptionAr: "ادفع عند الاستلام", descriptionEn: "Pay on delivery", iconUrl: null, type: "cod", requiresReference: false, requiresReceipt: false, isReceiptOptional: false, accountName: null, accountNumber: null, phoneNumber: null, iban: null, instructions: null, instructionsAr: null, instructionsEn: null, sortOrder: 1 }, { id: ids.bank, code: "bank_transfer", name: "تحويل بنكي", nameAr: "تحويل بنكي", nameEn: "Bank transfer", description: "أرفق الإيصال", descriptionAr: "أرفق الإيصال", descriptionEn: "Attach the receipt", iconUrl: null, type: "bank_transfer", requiresReference: true, requiresReceipt: true, isReceiptOptional: false, accountName: "Alnjoom Test", accountNumber: "123456", phoneNumber: null, iban: "SA00123456", instructions: "اختبار", instructionsAr: "استخدم بيانات الاختبار", instructionsEn: "Use test details", sortOrder: 2 }]; }
function cart() { const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0); return { cartId: ids.cart, currencyCode: "SAR", exchangeRateYerPerUnit: 1, subtotalYER: subtotal, subtotal, totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0), items: cartItems }; }
function session() { return { accessToken: "mock-access-token", refreshToken: "mock-refresh-token", customer: { id: ids.customer, storeId: ids.store, fullName: "عميل الاختبار", phone: "+966500000000", email: "customer@example.com", sessionId: "session-1", emailVerifiedAt: null, createdAt: new Date().toISOString() } }; }
function cors() { return { "Access-Control-Allow-Origin": "http://127.0.0.1:3100", "Access-Control-Allow-Methods": "PUT,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Expose-Headers": "ETag" }; }
async function readBody(req) { const chunks = []; for await (const chunk of req) chunks.push(chunk); return Buffer.concat(chunks); }
async function jsonBody(req) { const body = await readBody(req); if (!body.length) return {}; try { return JSON.parse(body.toString("utf8")); } catch { return {}; } }
function send(res, status, body, headers = {}) { res.writeHead(status, { ...headers, ...(body === null ? {} : { "Content-Type": "application/json; charset=utf-8" }) }); res.end(body === null ? undefined : JSON.stringify(body)); }
