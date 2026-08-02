import type { MetadataRoute } from "next";
import { getStoreConfigSafe } from "@/lib/api/storefront";
import { canonicalOrigin } from "@/lib/seo/metadata";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await getStoreConfigSafe();
  const enabled = config?.storeSettings.seoSettings.seoIndexEnabled ?? false;
  return {
    rules: enabled
      ? { userAgent: "*", allow: "/", disallow: ["/api/", "/account/", "/en/account/", "/cart", "/en/cart", "/checkout", "/en/checkout", "/search", "/en/search", "/login", "/en/login", "/privacy", "/terms", "/returns"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${canonicalOrigin(config)}/sitemap.xml`,
  };
}
