"use client";
import { useState } from "react";
import { Check, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { useCart, cartId } from "@/lib/store";
import { formatPrice, parseFormats, priceForFormat, type BookFormat } from "@/lib/book";
import { cn } from "@/lib/utils";

type BookLite = {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  cover: string;
  price: number;
  discountPercent: number | null;
  inStock: boolean;
  formats: unknown;
  isEbookOnly?: boolean;
};

export function AddToCart({ book, compact = false }: { book: BookLite; compact?: boolean }) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const router = useRouter();
  const add = useCart((s) => s.add);
  const formats = parseFormats(book.formats);
  const [selected, setSelected] = useState<BookFormat>(formats.find((f) => f.stock) ?? formats[0]);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const price = priceForFormat(book.price, selected, book.discountPercent);

  const handleAdd = () => {
    if (!book.inStock) return;
    setAdding(true);
    add(
      {
        id: cartId(book.id, selected.key),
        bookId: book.id,
        slug: book.slug,
        title: book.title,
        titleAr: book.titleAr,
        price,
        image: book.cover,
        format: selected.key,
      },
      qty
    );
    setTimeout(() => {
      setAdding(false);
      toast(t.product.added);
    }, 350);
  };

  const handleBuyNow = () => {
    handleAdd();
    setTimeout(() => router.push(`/${lang}/cart`), 400);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="label-base">{t.product.chooseFormat}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {formats.map((f) => {
            const fPrice = priceForFormat(book.price, f, book.discountPercent);
            return (
              <button
                key={f.key}
                type="button"
                disabled={!f.stock}
                onClick={() => setSelected(f)}
                className={cn(
                  "relative rounded-2xl border p-3 text-start transition",
                  selected.key === f.key
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/40",
                  !f.stock && "cursor-not-allowed opacity-40"
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{t.formats[f.key]}</span>
                  {selected.key === f.key ? <Check className="h-4 w-4 text-primary" /> : null}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{t.formats[`${f.key}Desc` as keyof typeof t.formats]}</span>
                <span className="mt-2 block text-sm font-bold text-primary">{formatPrice(fPrice, lang)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-border bg-card">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="-"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground/70 hover:bg-foreground/5"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-bold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            aria-label="+"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground/70 hover:bg-foreground/5"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!book.inStock || adding}
          className={cn("btn-primary flex-1 py-3", compact && "py-2.5")}
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
          {book.inStock ? t.product.addToCart : t.product.outOfStock}
        </button>

        <button type="button" onClick={handleBuyNow} disabled={!book.inStock} className="btn-secondary flex-1 py-3">
          {t.product.buyNow}
        </button>
      </div>
    </div>
  );
}
