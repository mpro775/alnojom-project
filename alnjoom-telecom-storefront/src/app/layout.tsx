import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/cairo";
import "./globals.css";
import { AppProviders } from "@/components/layout/app-providers";

export const metadata: Metadata = {
  title: { default: "النجوم تيليكوم", template: "%s | النجوم تيليكوم" },
  description: "متجر النجوم تيليكوم للتقنية والإلكترونيات.",
  icons: { icon: "/icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#075463",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-storefront-locale") === "en" ? "en" : "ar";
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">
          {locale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
