"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/components/providers";

const SORTS = ["newest", "priceAsc", "priceDesc", "rating", "best"] as const;

export function SortControl() {
  const { t } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "newest";

  const label: Record<(typeof SORTS)[number], string> = {
    newest: t.shop.sortNewest,
    priceAsc: t.shop.sortPriceAsc,
    priceDesc: t.shop.sortPriceDesc,
    rating: t.shop.sortRating,
    best: t.shop.sortBest,
  };

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t.shop.sortBy}</span>
      <select
        value={current}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", e.target.value);
          params.delete("page");
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }}
        className="appearance-none rounded-full border border-border bg-card py-2 pe-9 ps-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/40"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {label[s]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 h-4 w-4 text-muted-foreground" />
    </label>
  );
}
