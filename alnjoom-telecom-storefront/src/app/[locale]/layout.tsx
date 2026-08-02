import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { getCategoriesSafe, getStoreConfigSafe } from "@/lib/api/storefront";
import { isLocale } from "@/lib/i18n/locales";
import { homeMetadata, safeJsonLd } from "@/lib/seo/metadata";
import { localizedField } from "@/lib/i18n/fields";
import { AnalyticsRouteView } from "@/components/layout/analytics-route-view";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return homeMetadata(await getStoreConfigSafe(), raw);
}

export default async function StoreLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const [config, categories] = await Promise.all([getStoreConfigSafe(), getCategoriesSafe()]);
  const settings = config?.storeSettings;
  const organization = settings
    ? {
        "@context": "https://schema.org",
        "@type": "Store",
        name: localizedField({ ar: settings.nameAr, en: settings.nameEn, generic: settings.name }, locale),
        ...(settings.phone ? { telephone: settings.phone } : {}),
        ...(settings.address ? { address: { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: settings.city, addressCountry: settings.country } } : {}),
        ...(settings.latitude !== null && settings.longitude !== null ? { geo: { "@type": "GeoCoordinates", latitude: settings.latitude, longitude: settings.longitude } } : {}),
      }
    : null;
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader locale={locale} config={config} categories={categories} />
      {children}
      <StoreFooter locale={locale} config={config} categories={categories} />
      <AnalyticsRouteView />
      {organization ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(organization) }} /> : null}
    </div>
  );
}
