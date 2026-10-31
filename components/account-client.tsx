"use client";
import Link from "next/link";
import { useState } from "react";
import { KeyRound, Loader2, PackageSearch, SearchX, ShieldCheck } from "lucide-react";
import { useLang } from "@/components/providers";
import { findOrders, type OrderDTO } from "@/app/actions/orders";
import { OrderTimeline } from "@/components/order-timeline";
import { formatPrice } from "@/lib/book";
import { formatDate } from "@/lib/utils";

export function AccountClient() {
  const { t, lang } = useLang();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await findOrders("", phone);
    setOrders(res);
    setLoading(false);
  };

  return (
    <div className="container-store py-14">
      <div className="mx-auto max-w-3xl text-center">
        <KeyRound className="mx-auto h-10 w-10 text-primary" />
        <h1 className="section-title mt-4">{t.account.title}</h1>
        <p className="section-sub">{t.account.subtitle}</p>
      </div>

      <form onSubmit={submit} className="card-soft mx-auto mt-8 max-w-md p-6">
        <label className="label-base" htmlFor="ac-phone">{t.account.phoneLabel}</label>
        <div className="flex gap-3">
          <input
            id="ac-phone"
            required
            dir="ltr"
            placeholder="0555123456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-base flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageSearch className="h-4 w-4" />}
            <span className="hidden sm:inline">{t.account.button}</span>
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t.account.guestNote}</p>
      </form>

      {orders !== null && orders.length === 0 && (
        <div className="card-soft mx-auto mt-8 max-w-md p-8 text-center">
          <SearchX className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">{t.account.noOrders}</p>
        </div>
      )}

      <div className="mx-auto mt-8 max-w-3xl space-y-5">
        {orders?.map((o) => (
          <article key={o.id} className="card-soft p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Link href={`/${lang}/track?code=${o.code}`} className="font-display text-lg font-bold tracking-widest text-primary hover:underline" dir="ltr">
                {o.code}
              </Link>
              <div className="text-end text-sm">
                <p className="text-muted-foreground">{formatDate(o.createdAt, lang)}</p>
                <p className="font-bold text-primary">{formatPrice(o.total, lang)}</p>
              </div>
            </div>
            <OrderTimeline status={o.status} />
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href={`/${lang}/admin`} className="btn-secondary inline-flex">
          <ShieldCheck className="h-4 w-4" />
          {t.account.adminLink}
        </Link>
      </div>
    </div>
  );
}
