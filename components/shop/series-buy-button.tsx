"use client";
import { Loader2, Layers, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { useCart, cartId } from "@/lib/store";
import { formatPrice } from "@/lib/book";
import { localizedTitle } from "@/lib/book";

export type SeriesBookLite = {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  titleFr: string;
  cover: string;
  price: number;
  discountPercent: number | null;
};

export function SeriesBuyButton({
  seriesId,
  seriesTitle,
  bundlePrice,
  cover,
  books,
}: {
  seriesId: string;
  seriesTitle: string;
  bundlePrice: number;
  cover: string;
  books: SeriesBookLite[];
}) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const add = useCart((s) => s.add);
  const [busy, setBusy] = useState(false);

  const buy = () => {
    setBusy(true);
    add({
      id: cartId(`series-${seriesId}`, "bundle"),
      bookId: `series-${seriesId}`,
      slug: `series-${seriesId}`,
      title: seriesTitle,
      titleAr: seriesTitle,
      price: bundlePrice,
      image: cover,
      format: "bundle",
    });
    setTimeout(() => {
      setBusy(false);
      toast(t.product.added);
    }, 300);
  };

  return (
    <div className="card-soft mt-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Layers className="h-4 w-4 text-primary" />
            {t.product.seriesInfo}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {books.length} × {localizedTitle({ title: seriesTitle, titleAr: seriesTitle, titleFr: seriesTitle }, lang)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-end">
            <p className="text-xs text-muted-foreground">{t.product.seriesPrice}</p>
            <p className="text-lg font-bold text-primary">{formatPrice(bundlePrice, lang)}</p>
          </div>
          <button type="button" onClick={buy} disabled={busy} className="btn-primary">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            {t.product.seriesBuy}
          </button>
        </div>
      </div>
    </div>
  );
}
