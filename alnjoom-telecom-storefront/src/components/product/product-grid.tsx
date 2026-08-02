import type { Locale, Product } from "@/lib/api/contracts";
import { ProductCard } from "./product-card";

export function ProductGrid({ products, locale, currency }: { products: Product[]; locale: Locale; currency: string }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} locale={locale} currency={currency} />)}</div>;
}
