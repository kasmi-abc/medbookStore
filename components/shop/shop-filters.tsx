"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useLang } from "@/components/providers";
import { cn } from "@/lib/utils";

export type ShopFilterData = {
  categories: { slug: string; name: string; nameAr: string; nameFr: string; parentSlug: string | null }[];
  authors: string[];
  publishers: string[];
  years: number[];
  studyYears: string[];
  maxPrice: number;
};

const LANGUAGES = ["English", "French", "Arabic"];
const FORMATS = ["paperback", "hardcover", "ebook"] as const;

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b py-5 last:border-0">
      <h4 className="mb-3 text-sm font-bold">{label}</h4>
      {children}
    </div>
  );
}

export function ShopFilters({ data }: { data: ShopFilterData }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const catLabel = (c: { name: string; nameAr: string; nameFr: string }) =>
    lang === "ar" ? c.nameAr : lang === "fr" ? c.nameFr : c.name;

  const get = useCallback((k: string) => searchParams.get(k) ?? "", [searchParams]);

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (!v) params.delete(k);
        else params.set(k, v);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const [price, setPrice] = useState<number>(Number(get("price")) || data.maxPrice);
  useEffect(() => {
    setPrice(Number(get("price")) || data.maxPrice);
  }, [get, data.maxPrice]);

  const activeCount = ["category", "author", "publisher", "year", "study", "rating", "price", "lang", "format", "sale"].filter((k) => get(k)).length;

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["category", "author", "publisher", "year", "study", "rating", "price", "lang", "format", "sale"].forEach((k) => params.delete(k));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"
    );

  const panel = (
    <div className="text-sm">
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.shop.filters} {activeCount > 0 ? `(${activeCount})` : ""}
        </span>
        <button type="button" onClick={clearAll} className="text-xs font-medium text-primary hover:underline">
          {t.shop.clear}
        </button>
      </div>

      <Group label={t.shop.category}>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setParams({ category: null })} className={chip(!get("category"))}>
            {t.shop.all}
          </button>
          {data.categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setParams({ category: get("category") === c.slug ? null : c.slug })}
              className={cn(chip(get("category") === c.slug), c.parentSlug && "ms-4")}
            >
              {catLabel(c)}
            </button>
          ))}
        </div>
      </Group>

      <Group label={t.shop.price}>
        <input
          type="range"
          min={500}
          max={data.maxPrice}
          step={100}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          onMouseUp={() => setParams({ price: String(price) })}
          onTouchEnd={() => setParams({ price: String(price) })}
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>500 {t.common.currency}</span>
          <span className="font-semibold text-foreground">
            {price} {t.common.currency}
          </span>
        </div>
      </Group>

      <Group label={t.shop.rating}>
        <div className="flex flex-wrap gap-1.5">
          {[0, 4, 4.5, 4.7].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setParams({ rating: r === 0 ? null : String(r) })}
              className={chip(Number(get("rating") || 0) === r)}
            >
              {r === 0 ? t.shop.all : `★ ${r}+`}
            </button>
          ))}
        </div>
      </Group>

      <Group label={t.shop.author}>
        <select
          value={get("author")}
          onChange={(e) => setParams({ author: e.target.value })}
          className="input-base"
        >
          <option value="">{t.shop.all}</option>
          {data.authors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </Group>

      <Group label={t.shop.publisher}>
        <select value={get("publisher")} onChange={(e) => setParams({ publisher: e.target.value })} className="input-base">
          <option value="">{t.shop.all}</option>
          {data.publishers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Group>

      <Group label={t.shop.year}>
        <select value={get("year")} onChange={(e) => setParams({ year: e.target.value })} className="input-base">
          <option value="">{t.shop.all}</option>
          {data.years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </Group>

      <Group label={t.shop.studyYear}>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setParams({ study: null })} className={chip(!get("study"))}>
            {t.shop.all}
          </button>
          {data.studyYears.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setParams({ study: get("study") === s ? null : s })}
              className={chip(get("study") === s)}
            >
              {(t.studyYears as Record<string, string>)[s] ?? s}
            </button>
          ))}
        </div>
      </Group>

      <Group label={t.shop.language}>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <button key={l} type="button" onClick={() => setParams({ lang: get("lang") === l ? null : l })} className={chip(get("lang") === l)}>
              {l}
            </button>
          ))}
        </div>
      </Group>

      <Group label={t.shop.format}>
        <div className="flex flex-wrap gap-1.5">
          {FORMATS.map((f) => (
            <button key={f} type="button" onClick={() => setParams({ format: get("format") === f ? null : f })} className={chip(get("format") === f)}>
              {t.formats[f]}
            </button>
          ))}
        </div>
      </Group>

      <Group label={t.shop.onSale}>
        <button
          type="button"
          onClick={() => setParams({ sale: get("sale") ? null : "1" })}
          className={chip(!!get("sale"))}
        >
          {t.shop.onSale}
        </button>
      </Group>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary mb-4 lg:hidden">
        <SlidersHorizontal className="h-4 w-4" />
        {t.shop.filters}
        {activeCount > 0 ? ` (${activeCount})` : ""}
      </button>

      <aside className="card-soft sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto p-5 lg:block">{panel}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label={t.nav.close} className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-[88%] max-w-sm overflow-y-auto bg-card p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-lg font-bold">{t.shop.filters}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label={t.nav.close} className="rounded-full p-2 hover:bg-foreground/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            {panel}
            <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-4 w-full">
              {t.shop.apply}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
