"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";
import type { Locale, SmartFilter } from "@/lib/api/contracts";
import { Button } from "@/components/ui/button";

export function CatalogFilters({ filters, locale }: { filters: SmartFilter[]; locale: Locale }) {
  const current = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const initial = useMemo(() => selectionsFrom(current, filters), [current, filters]);
  const [values, setValues] = useState(initial.values);
  const [ranges, setRanges] = useState(initial.ranges);
  const [open, setOpen] = useState(false);

  if (!filters.length) return null;

  function apply() {
    const next = new URLSearchParams(current.toString());
    for (const key of [...next.keys()]) {
      if (key.startsWith("filters[") || key.startsWith("ranges[")) next.delete(key);
    }
    next.delete("page");
    for (const [slug, selected] of Object.entries(values)) selected.forEach((value) => next.append(`filters[${slug}]`, value));
    for (const [slug, range] of Object.entries(ranges)) {
      if (range.min) next.set(`ranges[${slug}][min]`, range.min);
      if (range.max) next.set(`ranges[${slug}][max]`, range.max);
    }
    router.push(`${pathname}${next.size ? `?${next.toString()}` : ""}`);
    setOpen(false);
  }

  const panel = <FilterPanel filters={filters} locale={locale} values={values} ranges={ranges} setValues={setValues} setRanges={setRanges} apply={apply} />;
  return (
    <>
      <aside className="hidden lg:block">{panel}</aside>
      <div className="mb-4 lg:hidden">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild><Button variant="secondary"><SlidersHorizontal className="size-4" />{locale === "ar" ? "تصفية النتائج" : "Filter results"}</Button></Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
            <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between"><Dialog.Title className="text-lg font-bold">{locale === "ar" ? "تصفية النتائج" : "Filter results"}</Dialog.Title><Dialog.Close className="grid size-11 place-items-center rounded-lg"><X className="size-5" /></Dialog.Close></div>
              {panel}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}

function FilterPanel({ filters, locale, values, ranges, setValues, setRanges, apply }: {
  filters: SmartFilter[];
  locale: Locale;
  values: Record<string, string[]>;
  ranges: Record<string, { min: string; max: string }>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setRanges: React.Dispatch<React.SetStateAction<Record<string, { min: string; max: string }>>>;
  apply: () => void;
}) {
  return (
    <div className="surface-card p-4">
      <h2 className="mb-4 font-bold">{locale === "ar" ? "الفلاتر" : "Filters"}</h2>
      <div className="space-y-5">
        {filters.map((filter) => (
          <fieldset key={filter.id} className="border-b border-line pb-5 last:border-0">
            <legend className="mb-3 text-sm font-bold">{locale === "ar" ? filter.nameAr : filter.nameEn}</legend>
            {filter.values?.length ? <div className="space-y-2">{filter.values.map((value) => {
              const checked = values[filter.slug]?.includes(value.slug) ?? false;
              return <label key={value.id} className="flex min-h-9 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={() => setValues((current) => ({ ...current, [filter.slug]: checked ? (current[filter.slug] ?? []).filter((item) => item !== value.slug) : [...(current[filter.slug] ?? []), value.slug] }))} /><span>{locale === "ar" ? value.labelAr : value.labelEn}</span>{typeof value.count === "number" ? <span className="ms-auto text-xs text-muted">{value.count}</span> : null}</label>;
            })}</div> : null}
            {filter.min !== undefined || filter.max !== undefined ? <div className="grid grid-cols-2 gap-2"><label className="text-xs text-muted">{locale === "ar" ? "من" : "Min"}<input className="field mt-1" inputMode="decimal" value={ranges[filter.slug]?.min ?? ""} onChange={(event) => setRanges((current) => ({ ...current, [filter.slug]: { min: event.target.value, max: current[filter.slug]?.max ?? "" } }))} /></label><label className="text-xs text-muted">{locale === "ar" ? "إلى" : "Max"}<input className="field mt-1" inputMode="decimal" value={ranges[filter.slug]?.max ?? ""} onChange={(event) => setRanges((current) => ({ ...current, [filter.slug]: { min: current[filter.slug]?.min ?? "", max: event.target.value } }))} /></label></div> : null}
          </fieldset>
        ))}
      </div>
      <Button className="mt-5 w-full" onClick={apply}>{locale === "ar" ? "تطبيق" : "Apply"}</Button>
    </div>
  );
}

function selectionsFrom(params: URLSearchParams, filters: SmartFilter[]) {
  const values: Record<string, string[]> = {};
  const ranges: Record<string, { min: string; max: string }> = {};
  for (const filter of filters) {
    values[filter.slug] = params.getAll(`filters[${filter.slug}]`);
    ranges[filter.slug] = { min: params.get(`ranges[${filter.slug}][min]`) ?? "", max: params.get(`ranges[${filter.slug}][max]`) ?? "" };
  }
  return { values, ranges };
}
