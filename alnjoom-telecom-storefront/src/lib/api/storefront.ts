import "server-only";

import type {
  Category,
  FulfillmentOptions,
  PaymentMethod,
  ProductDetails,
  ProductList,
  ProductQuestion,
  ProductReviews,
  SmartFilter,
  StoreConfig,
  OrderTracking,
} from "./contracts";
import { publicEndpoints } from "./endpoints";
import { backendFetch } from "./server-client";
import { cookies } from "next/headers";

export type SearchRecord = Record<string, string | string[] | undefined>;

export async function getStoreConfig(): Promise<StoreConfig> {
  const currencyCode = await selectedCurrency();
  return backendFetch<StoreConfig>(`${publicEndpoints.config}${currencyCode ? `?currencyCode=${encodeURIComponent(currencyCode)}` : ""}`, { revalidate: 60 });
}

export async function getStoreConfigSafe(): Promise<StoreConfig | null> {
  try {
    return await getStoreConfig();
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  return backendFetch<Category[]>(publicEndpoints.categories, { revalidate: 120 });
}

export async function getCategoriesSafe(): Promise<Category[]> {
  try {
    return await getCategories();
  } catch {
    return [];
  }
}

export async function getProducts(query: SearchRecord = {}): Promise<ProductList> {
  const params = toProductSearchParams(query);
  if (!params.has("currencyCode")) {
    const currencyCode = await selectedCurrency();
    if (currencyCode) params.set("currencyCode", currencyCode);
  }
  const suffix = params.size ? `?${params.toString()}` : "";
  return backendFetch<ProductList>(`${publicEndpoints.products}${suffix}`, { revalidate: 45 });
}

export async function getProductsSafe(query: SearchRecord = {}): Promise<ProductList> {
  try {
    return await getProducts(query);
  } catch {
    return { items: [], total: 0, page: 1, limit: 20 };
  }
}

export async function getProduct(slug: string, currencyCode?: string): Promise<ProductDetails> {
  const selected = currencyCode ?? (await selectedCurrency());
  const suffix = selected ? `?currencyCode=${encodeURIComponent(selected)}` : "";
  return backendFetch<ProductDetails>(`${publicEndpoints.product(slug)}${suffix}`, { revalidate: 45 });
}

export async function getFilters(input: { categoryId?: string; categorySlug?: string } = {}): Promise<SmartFilter[]> {
  const params = new URLSearchParams();
  if (input.categoryId) params.set("categoryId", input.categoryId);
  if (input.categorySlug) params.set("categorySlug", input.categorySlug);
  const suffix = params.size ? `?${params.toString()}` : "";
  return backendFetch<SmartFilter[]>(`${publicEndpoints.filters}${suffix}`, { revalidate: 90 });
}

export async function getFiltersSafe(input: { categoryId?: string; categorySlug?: string } = {}): Promise<SmartFilter[]> {
  try {
    return await getFilters(input);
  } catch {
    return [];
  }
}

export async function getProductReviews(productId: string): Promise<ProductReviews> {
  return backendFetch<ProductReviews>(`${publicEndpoints.productReviews(productId)}?limit=20&offset=0`, {
    revalidate: 30,
  });
}

export async function getProductReviewsSafe(productId: string): Promise<ProductReviews> {
  try {
    return await getProductReviews(productId);
  } catch {
    return {
      reviews: [],
      stats: { averageRating: 0, totalReviews: 0, ratingDistribution: [] },
    };
  }
}

export async function getProductQuestionsSafe(
  productId: string,
): Promise<{ items: ProductQuestion[]; total: number }> {
  try {
    return await backendFetch<{ items: ProductQuestion[]; total: number }>(
      `${publicEndpoints.productQuestions(productId)}?limit=20&offset=0`,
      { revalidate: 30 },
    );
  } catch {
    return { items: [], total: 0 };
  }
}

export async function getCheckoutBootstrapSafe(): Promise<{
  fulfillment: FulfillmentOptions | null;
  paymentMethods: PaymentMethod[];
}> {
  const [fulfillment, paymentMethods] = await Promise.all([
    backendFetch<FulfillmentOptions>(publicEndpoints.fulfillment, { revalidate: 30 }).catch(() => null),
    backendFetch<PaymentMethod[]>(publicEndpoints.paymentMethods, { revalidate: 30 }).catch(() => []),
  ]);
  return { fulfillment, paymentMethods };
}

export async function getOrderTracking(orderCode: string, phone?: string): Promise<OrderTracking> {
  const suffix = phone ? `?phone=${encodeURIComponent(phone)}` : "";
  return backendFetch<OrderTracking>(`${publicEndpoints.trackOrder(orderCode)}${suffix}`, { revalidate: false });
}

export function toProductSearchParams(query: SearchRecord): URLSearchParams {
  const params = new URLSearchParams();
  const allowed = /^(page|limit|q|categoryId|categorySlug|isFeatured|ids|brand|priceMin|priceMax|warehouse|inStock|currencyCode|filters\[[a-z0-9-]+\]|ranges\[[a-z0-9-]+\]\[(?:min|max)\]|attr\[[a-z0-9-]+\])$/i;
  for (const [key, raw] of Object.entries(query)) {
    if (!allowed.test(key) || raw === undefined) continue;
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (value.trim()) params.append(key, value.trim());
    }
  }
  return params;
}

async function selectedCurrency(): Promise<string | null> {
  const value = (await cookies()).get("alnjoom.currency")?.value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{3}$/.test(value) ? value : null;
}
