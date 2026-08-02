/**
 * Public/customer response contracts are derived from the return interfaces in
 * alnjoom-telecom-api/src. The generated OpenAPI currently describes routes and
 * many request DTOs, but most read responses are intentionally inline/unspecified.
 */

export type Locale = "ar" | "en";

export interface StoreCurrency {
  currencyCode: string;
  yerPerUnit: number;
  decimalDigits: number;
  roundingIncrement: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface SeoSettings {
  homeSeoTitleAr: string | null;
  homeSeoTitleEn: string | null;
  homeSeoDescriptionAr: string | null;
  homeSeoDescriptionEn: string | null;
  defaultSeoTitleAr: string | null;
  defaultSeoTitleEn: string | null;
  defaultSeoDescriptionAr: string | null;
  defaultSeoDescriptionEn: string | null;
  defaultOgImage: string | null;
  defaultTwitterImage: string | null;
  keywords: string[];
  googleSiteVerification: string | null;
  googleAnalyticsMeasurementId: string | null;
  bingSiteVerification: string | null;
  facebookDomainVerification: string | null;
  seoIndexEnabled: boolean;
  seoFollowDefault: boolean;
  canonicalBaseUrl: string | null;
  defaultLanguage: Locale;
  supportedLanguages: Locale[];
}

export interface StoreConfig {
  storeId: string;
  storeSlug: string;
  storeSettings: {
    id: string;
    name: string;
    nameAr: string | null;
    nameEn: string | null;
    descriptionAr: string | null;
    descriptionEn: string | null;
    description: string | null;
    slug: string;
    phone: string | null;
    address: string | null;
    country: string;
    city: string | null;
    addressDetails: string | null;
    latitude: number | null;
    longitude: number | null;
    workingHours: Array<{
      day: string;
      isClosed: boolean;
      slots: Array<{ open: string; close: string }>;
    }>;
    socialLinks: Partial<
      Record<"facebook" | "instagram" | "x" | "tiktok" | "snapchat" | "youtube", string | null>
    >;
    currencyCode: string;
    baseCurrencyCode: string;
    defaultCurrencyCode: string;
    currencies: StoreCurrency[];
    timezone: string;
    orderSettings: {
      minimumOrderValue: number;
      allowGuestCheckout: boolean;
      allowOrderCancellation: boolean;
      cancellationWindowMinutes: number;
      allowReturns: boolean;
      returnWindowDays: number;
      confirmationMode: string;
      stockDeductionTiming: string;
      orderNumberPrefix: string;
    };
    inventorySettings: {
      allowOutOfStockSales: boolean;
      lowStockAlertThreshold: number;
      reserveInventory: boolean;
      reservationTtlMinutes: number;
      warehouseSelectionMode: string;
      warehousePriority: string[];
      restoreStockOnCancellation: boolean;
    };
    taxSettings: {
      enabled: boolean;
      defaultRate: number;
      priceMode: string;
      exemptions: string[];
      categoryRates: Record<string, unknown>;
      taxNumber: string | null;
    };
    mobileAppConfig: {
      latestAndroidVersion: string | null;
      latestIosVersion: string | null;
      minimumAndroidVersion: string | null;
      minimumIosVersion: string | null;
      forceUpdate: boolean;
      maintenanceMode: boolean;
      maintenanceMessage: string | null;
    };
    seoSettings: SeoSettings;
  };
}

export interface Category {
  id: string;
  name: string;
  nameAr: string | null;
  nameEn: string | null;
  slug: string;
  description: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  imageAltAr: string | null;
  imageAltEn: string | null;
  backgroundImageUrl: string | null;
  seoTitleAr: string | null;
  seoTitleEn: string | null;
  seoDescriptionAr: string | null;
  seoDescriptionEn: string | null;
  parentId: string | null;
}

export interface Product {
  id: string;
  productType: "single" | "bundled" | "digital";
  isVisible: boolean;
  stockUnlimited: boolean;
  questionsEnabled: boolean;
  title: string;
  titleAr: string | null;
  titleEn: string | null;
  slug: string;
  description: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  shortDescriptionAr: string | null;
  shortDescriptionEn: string | null;
  detailedDescriptionAr: string | null;
  detailedDescriptionEn: string | null;
  categoryId: string | null;
  primaryImageUrl: string | null;
  priceFrom: number | null;
  priceFromYER: number | null;
  brand: string | null;
  weight: number | null;
  weightUnit: string | null;
  dimensions: { length?: number; width?: number; height?: number } | null;
  productLabel: string | null;
  youtubeUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoTitleAr: string | null;
  seoTitleEn: string | null;
  seoDescriptionAr: string | null;
  seoDescriptionEn: string | null;
  tags: string[];
  isFeatured: boolean;
  isTaxable: boolean;
  taxRate: number;
  minOrderQuantity: number;
  maxOrderQuantity: number | null;
  ratingAvg: number;
  ratingCount: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  titleAr: string | null;
  titleEn: string | null;
  sku: string;
  price: number;
  priceYER: number;
  compareAtPrice: number | null;
  compareAtPriceYER: number | null;
  stockQuantity: number;
  isDefault: boolean;
  attributes: Record<string, string>;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  variantId: string | null;
}

export interface ProductDetails extends Product {
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface ProductList {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface SmartFilterValue {
  id: string;
  labelAr: string;
  labelEn: string;
  slug: string;
  colorHex?: string | null;
  count?: number;
}

export interface SmartFilter {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  sourceType: "manual" | "brand" | "attribute" | "price" | "warehouse" | "availability";
  type: string;
  displayType: string | null;
  sourceAttributeId: string | null;
  values?: SmartFilterValue[];
  min?: number;
  max?: number;
}

export interface Cart {
  cartId: string;
  currencyCode: string;
  exchangeRateYerPerUnit: number;
  subtotalYER: number;
  subtotal: number;
  totalItems: number;
  items: Array<{
    productId: string;
    variantId: string;
    title: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    unitPriceYER: number;
    lineTotal: number;
    lineTotalYER: number;
  }>;
}

export interface ShippingMethod {
  id: string;
  zoneId: string;
  type: string;
  displayName: string;
  description: string | null;
  cost: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  city: string | null;
  area: string | null;
  description: string | null;
  fee: number;
}

export interface FulfillmentOptions {
  hasOptions: boolean;
  pickup: ShippingMethod[];
  deliveryZones: Array<ShippingZone & { methods: ShippingMethod[] }>;
}

export interface CheckoutQuote {
  subtotal: number;
  shippingFee: number;
  availableShippingMethods: ShippingMethod[];
  selectedShippingMethodId: string | null;
  promotionDiscount: number;
  pointsDiscount: number;
  total: number;
  currencyCode: string;
  exchangeRateYerPerUnit: number;
  subtotalYER: number;
  totalYER: number;
  shippingFeeYER: number;
  promotionDiscountYER: number;
  pointsDiscountYER: number;
  pointsToRedeemApplied: number;
  potentialEarnPoints: number;
  availablePoints: number;
}

export interface CheckoutResult {
  orderId: string;
  orderCode: string;
  status: string;
  total: number;
  currencyCode: string;
  exchangeRateYerPerUnit: number;
  subtotalYER: number;
  totalYER: number;
  shippingFeeYER: number;
  discountTotalYER: number;
  shippingFee: number;
  discountTotal: number;
  pointsRedeemed: number;
  pointsDiscountAmount: number;
  pointsDiscountAmountYER: number;
  pointsEarned: number;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  nameEn: string;
  description: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  iconUrl: string | null;
  type: string;
  requiresReference: boolean;
  requiresReceipt: boolean;
  isReceiptOptional: boolean;
  accountName: string | null;
  accountNumber: string | null;
  phoneNumber: string | null;
  iban: string | null;
  instructions: string | null;
  instructionsAr: string | null;
  instructionsEn: string | null;
  sortOrder: number;
}

export interface PresignedUpload {
  objectKey: string;
  uploadUrl: string;
  uploadHeaders: Record<string, string>;
  expiresAt: string;
  maxFileSizeBytes: number;
}

export interface MediaAsset {
  id: string;
  storeId: string;
  bucketName: string | null;
  objectKey: string;
  url: string;
  etag: string | null;
  mimeType: string;
  fileSizeBytes: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Customer {
  id: string;
  storeId: string;
  fullName: string;
  phone: string;
  email: string | null;
  sessionId?: string;
  emailVerifiedAt?: string | null;
  createdAt?: string;
}

export interface CustomerAuthResult {
  accessToken: string;
  refreshToken: string;
  customer: Customer;
}

export interface Address {
  id: string;
  addressLine: string;
  city: string | null;
  area: string | null;
  notes: string | null;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
  mapProvider: string | null;
  placeLabel: string | null;
}

export interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  slug: string;
  primaryImageUrl: string | null;
  priceFrom: number | null;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string | null;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  moderationStatus: "PENDING" | "APPROVED" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{ rating: number; count: number }>;
}

export interface ProductReviews {
  reviews: Review[];
  stats: ReviewStats;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  productTitle: string;
  customerId: string | null;
  customerName: string | null;
  question: string;
  answer: string | null;
  answeredBy: string | null;
  answeredByName: string | null;
  answeredAt: string | null;
  moderationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrder {
  id: string;
  orderCode: string;
  status: string;
  subtotal: number;
  total: number;
  shippingFee: number;
  discountTotal: number;
  currencyCode: string;
  createdAt: string;
}

export interface LoyaltyWallet {
  customerId: string;
  availablePoints: number;
  lockedPoints: number;
  lifetimeEarnedPoints: number;
  lifetimeRedeemedPoints: number;
}

export interface LoyaltyLedgerEntry {
  id: string;
  customerId: string;
  orderId: string | null;
  entryType: "earn" | "redeem" | "adjust" | "reverse";
  pointsDelta: number;
  amountDelta: number;
  balanceAfter: number;
  referenceEntryId: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  createdByStoreUserId: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  category: string | null;
  severity: string;
  title: string;
  body: string;
  status: "unread" | "read";
  readAt: string | null;
  actionUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SupportStatus = "open" | "waiting_agent" | "waiting_customer" | "resolved" | "closed";
export type SupportPriority = "low" | "normal" | "high" | "urgent";

export interface SupportTicket {
  id: string;
  storeId: string;
  scope: string;
  source: string;
  subject: string;
  description: string | null;
  status: SupportStatus;
  priority: SupportPriority;
  requester: { type: string; customerId: string | null; label: string | null; name: string | null };
  assignee: { type: string | null; storeUserId: string | null; label: string | null; name: string | null };
  sla: { firstResponseDueAt: string | null; resolveDueAt: string | null; firstResponseAt: string | null };
  resolvedAt: string | null;
  closedAt: string | null;
  lastMessageAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  authorType: string;
  authorLabel: string | null;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface OrderTracking {
  orderCode: string;
  status: string;
  total: number;
  currencyCode: string;
  timeline: Array<{
    status: string;
    note: string | null;
    createdAt: string;
  }>;
  updatedAt: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiValidationIssue {
  field?: string;
  message: string;
}

export interface RegisterInput {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
}

export interface LoginInput {
  phoneOrEmail: string;
  password: string;
}

export interface AddressInput {
  addressLine: string;
  city?: string;
  area?: string;
  notes?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
  mapProvider?: string;
  placeLabel?: string;
}

export interface CheckoutInput {
  cartId: string;
  currencyCode?: string;
  customerName: string;
  customerPhone: string;
  customerAddressId?: string;
  customerEmail?: string;
  addressLine?: string;
  city?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  mapProvider?: string;
  placeLabel?: string;
  shippingZoneId?: string;
  shippingMethodId?: string;
  fulfillmentZoneId?: string;
  fulfillmentMethodId?: string;
  couponCode?: string;
  note?: string;
  paymentMethod?: "cod" | "bank_transfer" | "wallet" | "transfer";
  storePaymentMethodId?: string;
  payerReference?: string;
  payerReceiptMediaAssetId?: string;
  payerNote?: string;
  restockToken?: string;
  pointsToRedeem?: number;
}

export type CheckoutQuoteInput = Pick<
  CheckoutInput,
  | "cartId"
  | "currencyCode"
  | "shippingZoneId"
  | "shippingMethodId"
  | "fulfillmentZoneId"
  | "fulfillmentMethodId"
  | "couponCode"
  | "pointsToRedeem"
>;
