const encode = (value: string) => encodeURIComponent(value);

export const publicEndpoints = {
  config: "/app/config",
  store: "/app/store",
  categories: "/app/categories",
  filters: "/app/filters",
  products: "/app/products",
  product: (slug: string) => `/app/products/${encode(slug)}`,
  events: "/app/events",
  cartItems: "/app/cart/items",
  cart: (cartId: string) => `/app/cart/${encode(cartId)}`,
  cartItem: (cartId: string, variantId: string) =>
    `/app/cart/${encode(cartId)}/items/${encode(variantId)}`,
  fulfillment: "/app/fulfillment-options",
  shippingZones: "/app/shipping-zones",
  paymentMethods: "/app/payment-methods",
  paymentReceiptPresign: "/app/payment-receipts/presign",
  paymentReceipts: "/app/payment-receipts",
  checkoutQuote: "/app/checkout/quote",
  checkoutSummary: "/app/checkout/summary",
  checkout: "/app/checkout",
  trackOrder: (orderCode: string) => `/app/orders/${encode(orderCode)}/track`,
  productReviews: (productId: string) => `/customers/products/${encode(productId)}/reviews`,
  productQuestions: (productId: string) => `/customers/products/${encode(productId)}/questions`,
} as const;

export const customerEndpoints = {
  register: "/customers/register",
  login: "/customers/login",
  refresh: "/customers/refresh",
  logout: "/customers/logout",
  forgotPassword: "/customers/forgot-password",
  resetPassword: "/customers/reset-password",
  otpRequest: "/customers/otp/request",
  otpVerify: "/customers/otp/verify",
  otpResend: "/customers/otp/resend",
  me: "/customers/me",
  addresses: "/customers/addresses",
  address: (id: string) => `/customers/addresses/${encode(id)}`,
  wishlist: "/customers/wishlist",
  wishlistProduct: (productId: string) => `/customers/wishlist/${encode(productId)}`,
  wishlistCheck: (productId: string) => `/customers/wishlist/${encode(productId)}/check`,
  reviews: "/customers/reviews",
  review: (id: string) => `/customers/reviews/${encode(id)}`,
  questions: (productId: string) => `/customers/products/${encode(productId)}/questions`,
  restock: (productId: string) =>
    `/customers/products/${encode(productId)}/restock-subscriptions`,
  orders: "/customers/orders",
  loyaltyWallet: "/customers/loyalty/wallet",
  loyaltyLedger: "/customers/loyalty/ledger",
  notifications: "/customers/notifications/inbox",
  notificationCount: "/customers/notifications/unread-count",
  notificationRead: (id: string) => `/customers/notifications/${encode(id)}/read`,
  notificationsReadAll: "/customers/notifications/read-all",
  supportTickets: "/customers/support/tickets",
  supportTicket: (id: string) => `/customers/support/tickets/${encode(id)}`,
  supportMessages: (id: string) => `/customers/support/tickets/${encode(id)}/messages`,
  supportStatus: (id: string) => `/customers/support/tickets/${encode(id)}/status`,
} as const;

export function toStorefrontBff(path: string): string {
  return `/api/storefront/${path.replace(/^\/app\//, "")}`;
}

export function toCustomerBff(path: string): string {
  return `/api/customer/${path.replace(/^\/customers\//, "")}`;
}

export function toAuthBff(path: string): string {
  return `/api/auth/${path.replace(/^\/customers\//, "")}`;
}
