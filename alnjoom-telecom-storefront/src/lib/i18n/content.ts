import type { Locale } from "@/lib/api/contracts";

const copy = {
  ar: {
    announcement: "تقنية موثوقة وتجربة شراء واضحة",
    searchPlaceholder: "ابحث عن منتج أو علامة تجارية",
    heroEyebrow: "النجوم تيليكوم",
    heroTitle: "تقنية موثوقة، مختارة لك.",
    heroBody: "جوالات وإلكترونيات وإكسسوارات مختارة بعناية، بتجربة شراء سريعة وواضحة.",
    shopNow: "تسوّق الآن",
    categories: "تصفّح الأقسام",
    featured: "اختيارات النجوم",
    allProducts: "كل المنتجات",
    trust: ["دفع آمن عبر الطرق المفعلة", "أسعار ومخزون مباشر", "خيارات استلام وتوصيل واضحة"],
  },
  en: {
    announcement: "Trusted technology and a clear shopping experience",
    searchPlaceholder: "Search products or brands",
    heroEyebrow: "Alnjoom Telecom",
    heroTitle: "Trusted technology, selected for you.",
    heroBody: "Carefully selected phones, electronics and accessories in a fast, straightforward store.",
    shopNow: "Shop now",
    categories: "Browse categories",
    featured: "Alnjoom picks",
    allProducts: "All products",
    trust: ["Secure enabled payment methods", "Live prices and availability", "Clear pickup and delivery choices"],
  },
} as const;

export function t(locale: Locale) {
  return copy[locale];
}
