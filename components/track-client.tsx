"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, Loader2, PackageSearch, Phone, SearchX } from "lucide-react";
import { useLang } from "@/components/providers";
import { findOrders, type OrderDTO } from "@/app/actions/orders";
import { OrderTimeline } from "@/components/order-timeline";
import { buildOrderReceipt } from "@/lib/receipt";
import { wilayaByCode } from "@/lib/shipping";
import { formatDate } from "@/lib/utils";
import { formatPrice } from "@/lib/book";

export function TrackClient() {
  const { t, lang } = useLang();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await findOrders(code, phone || undefined);
    setOrders(res);
    setLoading(false);
  };

  const wilayaName = (code: string) => {
    const w = wilayaByCode(code);
    if (!w) return code;
    return lang === "ar" ? `${w.code} - ${w.nameAr}` : lang === "fr" ? `${w.code} - ${w.nameFr}` : `${w.code} - ${w.name}`;
  };

  return (
    <>
      <form onSubmit={submit} className="card-soft mx-auto max-w-xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base" htmlFor="tr-code">{t.track.codeLabel}</label>
            <input
              id="tr-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="MDZ-XXXXXX"
              dir="ltr"
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base" htmlFor="tr-phone">{t.track.phoneLabel}</label>
            <input id="tr-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0555123456" dir="ltr" className="input-base" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-5 w-full py-3">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageSearch className="h-4 w-4" />}
          {t.track.button}
        </button>
      </form>

      {orders !== null && orders.length === 0 && (
        <div className="card-soft mx-auto mt-8 max-w-xl p-10 text-center">
          <SearchX className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-lg font-bold">{t.track.notFound}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.track.notFoundText}</p>
          <Link href={`/${lang}/contact`} className="btn-secondary mt-6 inline-flex">
            <Phone className="h-4 w-4" />
            {t.track.contactUs}
          </Link>
        </div>
      )}

      <div className="mx-auto mt-8 max-w-3xl space-y-6">
        {orders?.map((o) => (
          <article key={o.id} className="card-soft p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.track.codeLabel}</p>
                <p className="font-display text-xl font-bold tracking-widest text-primary" dir="ltr">{o.code}</p>
              </div>
              <div className="text-end text-sm">
                <p className="text-muted-foreground">{t.track.orderedOn}</p>
                <p className="font-medium">{formatDate(o.createdAt, lang)}</p>
              </div>
              <button
                type="button"
                onClick={() => buildOrderReceipt(o)}
                className="btn-secondary !py-2"
              >
                <Download className="h-4 w-4" />
                {t.checkout.receipt}
              </button>
            </div>

            <OrderTimeline status={o.status} />

            <div className="mt-6 grid gap-4 rounded-2xl bg-muted/50 p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">{t.track.shipTo}</p>
                <p className="font-medium">{o.customerName}</p>
                <p className="text-muted-foreground">{wilayaName(o.wilaya)} — {o.commune}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.shippingTypes[o.shippingType]}</p>
                <p className="font-medium">{formatPrice(o.shippingFee, lang)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.track.total}</p>
                <p className="font-bold text-primary">{formatPrice(o.total, lang)}</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {lang === "ar" ? i.titleAr || i.title : i.title}{" "}
                    <span className="text-muted-foreground">× {i.quantity}</span>
                  </span>
                  <span className="font-semibold">{formatPrice(i.price * i.quantity, lang)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}
