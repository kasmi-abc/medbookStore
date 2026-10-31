"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Download, Loader2, ShieldCheck, Truck } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { useCart } from "@/lib/store";
import { createOrder, findOrders, type CheckoutResult } from "@/app/actions/orders";
import { buildOrderReceipt } from "@/lib/receipt";
import { WILAYAS, shippingFee, wilayaLabel } from "@/lib/shipping";
import { formatPrice } from "@/lib/book";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clearCart = useCart((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Extract<CheckoutResult, { ok: true }> | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    wilaya: "",
    commune: "",
    address: "",
    shippingType: "STOP_DESK" as "STOP_DESK" | "A_DOMICILE",
    paymentMethod: "COD" as "COD" | "CARD",
    promoCode: "",
    note: "",
  });
  const [promoApplied, setPromoApplied] = useState<{ code: string; percent: number } | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);
  const [giftApplied, setGiftApplied] = useState<{ code: string; amount: number } | null>(null);
  const [giftCode, setGiftCode] = useState("");
  const [giftChecking, setGiftChecking] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [receiptBusy, setReceiptBusy] = useState(false);

  useEffect(() => setMounted(true), []);

  const go = (path: string) => `/${lang}${path}`;
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const fee = form.wilaya ? shippingFee(form.wilaya, form.shippingType) : 0;
  const discount = promoApplied ? Math.round((total * promoApplied.percent) / 100) : 0;
  const giftDiscount = giftApplied ? Math.min(giftApplied.amount, Math.max(0, total - discount)) : 0;
  const grand = Math.max(0, total - discount - giftDiscount) + fee;

  const checkPromo = async () => {
    const code = form.promoCode.trim().toUpperCase();
    if (!code) return;
    setPromoChecking(true);
    const res = await fetch(`/api/promo?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    setPromoChecking(false);
    if (data.ok) {
      setPromoApplied({ code, percent: data.percent });
      toast(`-${data.percent}%`);
    } else {
      setPromoApplied(null);
      toast(t.common.error);
    }
  };

  const checkGift = async () => {
    const raw = giftCode.trim().toUpperCase();
    if (!raw) return;
    setGiftChecking(true);
    try {
      const res = await fetch(`/api/giftcard?code=${encodeURIComponent(raw)}`);
      const data = await res.json();
      if (data.ok) {
        setGiftApplied({ code: data.code, amount: data.amount });
        toast(formatPrice(data.amount, lang));
      } else {
        setGiftApplied(null);
        toast(t.checkout.giftError);
      }
    } catch {
      toast(t.common.error);
    } finally {
      setGiftChecking(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await createOrder({
      ...form,
      promoCode: promoApplied?.code,
      giftCardCode: giftApplied?.code,
      giftMessage: giftApplied ? giftMessage : undefined,
      items: items.map((i) => ({
        bookId: i.bookId,
        title: lang === "ar" ? i.titleAr || i.title : i.title,
        titleAr: i.titleAr,
        price: i.price,
        quantity: i.quantity,
        format: i.format,
        image: i.image,
      })),
    });
    setBusy(false);
    if (res.ok) {
      clearCart();
      setResult(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (res.error === "promo") {
      toast(t.common.error);
    } else if (res.error === "gift") {
      toast(t.checkout.giftError);
      setGiftApplied(null);
      setGiftCode("");
    } else {
      toast(t.checkout.required);
    }
  };

  const downloadReceipt = async () => {
    if (!result) return;
    setReceiptBusy(true);
    try {
      const orders = await findOrders(result.code);
      if (orders[0]) buildOrderReceipt(orders[0]);
    } catch {
      toast(t.common.error);
    } finally {
      setReceiptBusy(false);
    }
  };

  if (!mounted) {
    return <div className="container-store py-20 text-center text-muted-foreground">{t.common.loading}</div>;
  }

  if (result) {
    return (
      <div className="container-store py-20 text-center">
        <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold">{t.checkout.success}</h1>
        <p className="mt-3 text-muted-foreground">{t.checkout.successText}</p>
        <p className="mt-2 inline-block rounded-2xl border border-dashed border-primary/50 bg-primary/5 px-6 py-3 font-display text-2xl font-extrabold tracking-widest text-primary" dir="ltr">
          {result.code}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">{t.checkout.successNote}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={go(`/track?code=${result.code}`)} className="btn-primary">
            {t.checkout.continueTrack}
          </Link>
          <Link href={go("/shop")} className="btn-secondary">
            {t.checkout.continueShopping}
          </Link>
          <button type="button" onClick={downloadReceipt} disabled={receiptBusy} className="btn-secondary">
            {receiptBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {t.checkout.receipt}
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-store py-20 text-center">
        <h1 className="font-display text-2xl font-bold">{t.checkout.emptyCart}</h1>
        <Link href={go("/shop")} className="btn-primary mt-6">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-store py-10">
      <div className="mb-8">
        <h1 className="section-title">{t.checkout.title}</h1>
        <p className="section-sub">{t.checkout.subtitle}</p>
      </div>

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="card-soft p-6">
            <h2 className="mb-4 font-display text-lg font-bold">{t.checkout.contactInfo}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-base" htmlFor="c-name">{t.checkout.fullName} *</label>
                <input id="c-name" required minLength={3} value={form.customerName} onChange={(e) => set("customerName", e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="label-base" htmlFor="c-phone">{t.checkout.phone} *</label>
                <input
                  id="c-phone"
                  required
                  inputMode="tel"
                  placeholder="0555123456"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="input-base"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-base" htmlFor="c-email">{t.checkout.email}</label>
                <input id="c-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="input-base" dir="ltr" />
              </div>
            </div>
          </section>

          <section className="card-soft p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <Truck className="h-5 w-5 text-primary" />
              {t.checkout.delivery}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-base" htmlFor="c-wilaya">{t.checkout.wilaya} *</label>
                <select id="c-wilaya" required value={form.wilaya} onChange={(e) => set("wilaya", e.target.value)} className="input-base">
                  <option value="">{t.checkout.selectWilaya}</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {wilayaLabel(w, lang)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-base" htmlFor="c-commune">{t.checkout.commune} *</label>
                <input id="c-commune" required value={form.commune} onChange={(e) => set("commune", e.target.value)} className="input-base" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["STOP_DESK", "A_DOMICILE"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("shippingType", type)}
                  className={cn(
                    "rounded-2xl border p-4 text-start transition",
                    form.shippingType === type ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"
                  )}
                >
                  <span className="flex items-center justify-between text-sm font-semibold">
                    {t.shippingTypes[type]}
                    {form.wilaya ? (
                      <span className="text-primary">{formatPrice(shippingFee(form.wilaya, type), lang)}</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {type === "STOP_DESK" ? t.checkout.stopDeskDesc : t.checkout.homeDesc}
                  </span>
                </button>
              ))}
            </div>

            {form.shippingType === "A_DOMICILE" && (
              <div className="mt-4">
                <label className="label-base" htmlFor="c-addr">{t.checkout.address}</label>
                <input id="c-addr" value={form.address} onChange={(e) => set("address", e.target.value)} className="input-base" />
              </div>
            )}

            <div className="mt-4">
              <label className="label-base" htmlFor="c-note">{t.checkout.note}</label>
              <textarea id="c-note" rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} className="input-base resize-none" />
            </div>
          </section>

          <section className="card-soft p-6">
            <h2 className="mb-4 font-display text-lg font-bold">{t.checkout.payment}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => set("paymentMethod", "COD")}
                className={cn(
                  "rounded-2xl border p-4 text-start transition",
                  form.paymentMethod === "COD" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Banknote className="h-4 w-4 text-primary" />
                  {t.checkout.cod}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{t.checkout.codDesc}</span>
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-2xl border border-border bg-muted/40 p-4 text-start opacity-50"
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="h-4 w-4" />
                  {t.checkout.cib}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{t.checkout.cardDesc}</span>
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-2xl border border-border bg-muted/40 p-4 text-start opacity-50"
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="h-4 w-4" />
                  {t.checkout.edahabia}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{t.checkout.cardDesc}</span>
              </button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t.checkout.cardSoon}</p>
          </section>
        </div>

        <aside className="card-soft sticky top-24 h-fit p-6">
          <h2 className="font-display text-lg font-bold">{t.checkout.summary}</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pe-1 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={i.image} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 font-medium">{lang === "ar" ? i.titleAr || i.title : i.title}</span>
                  <span className="text-xs text-muted-foreground">× {i.quantity}</span>
                </span>
                <span className="font-semibold">{formatPrice(i.price * i.quantity, lang)}</span>
              </li>
            ))}
          </ul>

          <div className="divider my-4" />

          <div className="flex gap-2">
            <input
              value={form.promoCode}
              onChange={(e) => set("promoCode", e.target.value)}
              placeholder={t.cart.promoPlaceholder}
              className="input-base flex-1"
              dir="ltr"
            />
            <button type="button" onClick={checkPromo} disabled={promoChecking} className="btn-secondary shrink-0">
              {promoChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : t.cart.apply}
            </button>
          </div>

          <p className="label-base mb-2 mt-4">{t.checkout.giftCard}</p>
          <div className="flex gap-2">
            <input
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              placeholder={t.checkout.giftCardPlaceholder}
              className="input-base flex-1"
              dir="ltr"
            />
            <button
              type="button"
              onClick={checkGift}
              disabled={giftChecking || !giftCode.trim()}
              className="btn-secondary shrink-0"
            >
              {giftChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : t.checkout.applyGiftCard}
            </button>
          </div>

          {giftApplied && (
            <div className="mt-3 space-y-2 rounded-2xl border border-primary/40 bg-primary/5 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-primary" dir="ltr">
                  {giftApplied.code}
                </span>
                <span className="font-bold text-primary">{formatPrice(giftApplied.amount, lang)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGiftApplied(null);
                  setGiftCode("");
                  setGiftMessage("");
                }}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                {t.cart.remove}
              </button>
              <div>
                <label className="label-base" htmlFor="c-gift-msg">
                  {t.checkout.giftMessage}
                </label>
                <textarea
                  id="c-gift-msg"
                  rows={2}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder={t.checkout.giftMessagePlaceholder}
                  className="input-base resize-none"
                />
              </div>
            </div>
          )}

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.cart.subtotal}</dt>
              <dd className="font-semibold">{formatPrice(total, lang)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary">
                <dt>{t.cart.discount} ({promoApplied?.code})</dt>
                <dd>-{formatPrice(discount, lang)}</dd>
              </div>
            )}
            {giftDiscount > 0 && (
              <div className="flex justify-between text-primary">
                <dt>{t.checkout.giftCard} ({giftApplied?.code})</dt>
                <dd>-{formatPrice(giftDiscount, lang)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.track.shippingFee}</dt>
              <dd className="font-semibold">{form.wilaya ? formatPrice(fee, lang) : "—"}</dd>
            </div>
            <div className="divider" />
            <div className="flex justify-between text-base font-bold">
              <dt>{t.cart.total}</dt>
              <dd className="text-primary">{formatPrice(grand, lang)}</dd>
            </div>
          </dl>

          <button type="submit" disabled={busy} className="btn-primary mt-6 w-full py-3">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {busy ? t.checkout.placing : t.checkout.placeOrder}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">{t.checkout.agreeTerms}</p>
        </aside>
      </form>
    </div>
  );
}
