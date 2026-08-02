import type { ProductVariant } from "@/lib/api/contracts";

export function initialVariant(variants: ProductVariant[]): ProductVariant | null {
  const defaultVariant = variants.find((variant) => variant.isDefault);
  if (defaultVariant) return defaultVariant;
  return variants.length === 1 ? variants[0] ?? null : null;
}

export function attributeOptions(variants: ProductVariant[]): Array<{ name: string; values: string[] }> {
  const values = new Map<string, Set<string>>();
  for (const variant of variants) {
    for (const [name, value] of Object.entries(variant.attributes)) {
      const set = values.get(name) ?? new Set<string>();
      set.add(value);
      values.set(name, set);
    }
  }
  return [...values.entries()].map(([name, set]) => ({ name, values: [...set] }));
}

export function matchingVariant(variants: ProductVariant[], selected: Record<string, string>): ProductVariant | null {
  const keys = Object.keys(selected);
  return variants.find((variant) => keys.every((key) => variant.attributes[key] === selected[key]) && Object.keys(variant.attributes).length === keys.length) ?? null;
}

export function optionAvailable(variants: ProductVariant[], selected: Record<string, string>, attribute: string, value: string, stockUnlimited: boolean): boolean {
  const candidate = { ...selected, [attribute]: value };
  return variants.some((variant) => Object.entries(candidate).every(([key, selectedValue]) => variant.attributes[key] === selectedValue) && (stockUnlimited || variant.stockQuantity > 0));
}
