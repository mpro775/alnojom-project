"use client";

import { apiClient } from "@/lib/api/client";
import { publicEndpoints, toStorefrontBff } from "@/lib/api/endpoints";

export const storefrontEvents = ["sf_home_viewed", "sf_category_viewed", "sf_product_viewed", "sf_section_clicked", "sf_add_to_cart_clicked", "sf_cart_viewed", "sf_cart_item_updated", "sf_checkout_started", "sf_checkout_step_completed", "sf_checkout_submitted", "sf_checkout_completed", "sf_order_tracking_viewed"] as const;
export type StorefrontEventName = (typeof storefrontEvents)[number];

export function trackEvent(eventName: StorefrontEventName, input: { productId?: string; variantId?: string; cartId?: string; orderId?: string; metadata?: Record<string, string | number | boolean | null> } = {}) {
  const payload = { eventName, ...input };
  void apiClient(toStorefrontBff(publicEndpoints.events), { method: "POST", body: JSON.stringify(payload), keepalive: true }).catch(() => undefined);
}
