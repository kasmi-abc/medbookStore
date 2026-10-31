"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { useCart } from "@/lib/store";
import { formatPrice } from "@/lib/book";

export default function CartPage() {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.total());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const go = (path: string) => `/${lang}${path}`;

  if (!mounted) {
    return <div className="container-store py-20 text-center text-muted-foreground">{t.common.loading}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-store py-20 text-center">
        <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold">{t.cart.empty}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.cart.emptyText}</p>
        <Link href={go("/shop")} className="btn-primary mt-8">
          {t.cart.browse}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-store py-10">
      <h1 className="section-title mb-8">{t.cart.title}</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="card-soft flex gap-4 p-4">
              <Link href={go(`/book/${item.slug}`)} className="book-cover h-28 w-20 shrink-0">
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={go(`/book/${item.slug}`)} className="line-clamp-2 text-sm font-semibold hover:text-primary">
                      {lang === "ar" ? item.titleAr || item.title : item.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.formats[item.format as keyof typeof t.formats] ?? item.format}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={t.cart.remove}
                    className="rounded-full p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button type="button" onClick={() => dec(item.id)} aria-label="-" className="inline-flex h-9 w-9 items-center justify-center hover:bg-foreground/5">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                    <button type="button" onClick={() => inc(item.id)} aria-label="+" className="inline-flex h-9 w-9 items-center justify-center hover:bg-foreground/5">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-display text-lg font-bold text-primary">
                    {formatPrice(item.price * item.quantity, lang)}
                  </span>
                </div>
              </div>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                clear();
                toast(t.cart.clearCart);
              }}
              className="text-sm font-medium text-muted-foreground hover:text-red-500"
            >
              {t.cart.clearCart}
            </button>
          </li>
        </ul>

        <aside className="card-soft sticky top-24 h-fit p-6">
          <h2 className="font-display text-lg font-bold">{t.cart.total}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.cart.subtotal}</dt>
              <dd className="font-semibold">{formatPrice(total, lang)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>{t.track.shippingFee}</dt>
              <dd>{t.cart.shippingCalc}</dd>
            </div>
            <div className="divider" />
            <div className="flex justify-between text-base font-bold">
              <dt>{t.cart.total}</dt>
              <dd className="text-primary">{formatPrice(total, lang)}</dd>
            </div>
          </dl>
          <Link href={go("/checkout")} className="btn-primary mt-6 w-full py-3">
            {t.cart.checkout}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" />
            {t.cart.freeShippingHint}
          </p>
          <Link href={go("/shop")} className="btn-ghost mt-3 w-full">
            {t.cart.continue}
          </Link>
        </aside>
      </div>
    </div>
  );
}
