"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, type StorefrontEventName } from "@/lib/analytics/storefront-events";

export function AnalyticsRouteView() {
  const pathname = usePathname();
  useEffect(() => {
    const normalized = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
    let event: StorefrontEventName | null = null;
    if (normalized === "/") event = "sf_home_viewed";
    else if (normalized.startsWith("/category/")) event = "sf_category_viewed";
    else if (normalized.startsWith("/product/")) event = "sf_product_viewed";
    else if (normalized === "/cart") event = "sf_cart_viewed";
    else if (normalized === "/checkout") event = "sf_checkout_started";
    else if (normalized.startsWith("/track-order/")) event = "sf_order_tracking_viewed";
    if (event) trackEvent(event);
  }, [pathname]);
  return null;
}
