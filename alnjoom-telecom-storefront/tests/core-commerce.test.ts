import { describe, expect, it } from "vitest";
import { localizedField } from "@/lib/i18n/fields";
import { formatMoney, validDiscountPercent } from "@/lib/format/commerce";
import { initialVariant, matchingVariant, optionAvailable } from "@/features/catalog/variants";
import type { ProductVariant } from "@/lib/api/contracts";

const variants: ProductVariant[] = [
  { id: "1", title: "Black 128", titleAr: null, titleEn: null, sku: "B128", price: 100, priceYER: 100, compareAtPrice: 120, compareAtPriceYER: 120, stockQuantity: 4, isDefault: true, attributes: { Color: "Black", Storage: "128" } },
  { id: "2", title: "Black 256", titleAr: null, titleEn: null, sku: "B256", price: 130, priceYER: 130, compareAtPrice: null, compareAtPriceYER: null, stockQuantity: 0, isDefault: false, attributes: { Color: "Black", Storage: "256" } },
  { id: "3", title: "Gold 256", titleAr: null, titleEn: null, sku: "G256", price: 140, priceYER: 140, compareAtPrice: null, compareAtPriceYER: null, stockQuantity: 3, isDefault: false, attributes: { Color: "Gold", Storage: "256" } },
];

describe("localized fields", () => {
  it("uses locale-specific, generic, then opposite-language precedence", () => {
    expect(localizedField({ ar: "عربي", en: "English", generic: "Generic" }, "ar")).toBe("عربي");
    expect(localizedField({ ar: null, en: "English", generic: "Generic" }, "ar")).toBe("Generic");
    expect(localizedField({ ar: "عربي", en: null, generic: null }, "en")).toBe("عربي");
  });
});

describe("currency and discount presentation", () => {
  it("formats the backend amount without changing it", () => {
    expect(formatMoney(125.5, "SAR", "en")).toContain("125.50");
  });
  it("only derives a discount when compare-at is higher", () => {
    expect(validDiscountPercent(75, 100)).toBe(25);
    expect(validDiscountPercent(100, 100)).toBeNull();
    expect(validDiscountPercent(100, null)).toBeNull();
  });
});

describe("generic variant selection", () => {
  it("selects the backend default and matches arbitrary attributes", () => {
    expect(initialVariant(variants)?.id).toBe("1");
    expect(matchingVariant(variants, { Color: "Gold", Storage: "256" })?.id).toBe("3");
  });
  it("disables combinations that only map to out-of-stock variants", () => {
    expect(optionAvailable(variants, { Color: "Black" }, "Storage", "256", false)).toBe(false);
    expect(optionAvailable(variants, { Color: "Gold" }, "Storage", "256", false)).toBe(true);
    expect(optionAvailable(variants, { Color: "Black" }, "Storage", "256", true)).toBe(true);
  });
});
