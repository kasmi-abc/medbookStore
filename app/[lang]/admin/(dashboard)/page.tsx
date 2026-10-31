import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, Package, PackageCheck, Timer } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/book";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.admin.dashboard} · Medical Books DZ`, robots: { index: false } };
}

export default async function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const [revenue, totalOrders, pending, delivered, booksCount, recent, topBooks] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.book.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.book.findMany({ orderBy: { salesCount: "desc" }, take: 5, select: { id: true, title: true, titleAr: true, cover: true, salesCount: true, price: true } }),
  ]);

  const stats = [
    { label: t.admin.revenue, value: formatPrice(revenue._sum.total ?? 0, locale), icon: DollarSign },
    { label: t.admin.totalOrders, value: String(totalOrders), icon: Package },
    { label: t.admin.pendingOrders, value: String(pending), icon: Timer },
    { label: t.admin.deliveredOrders, value: String(delivered), icon: PackageCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-soft p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-soft p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-bold">{t.admin.recentOrders}</h2>
            <Link href={`/${locale}/admin/orders`} className="text-xs font-semibold text-primary hover:underline">
              {t.nav.viewAll}
            </Link>
          </div>
          <ul className="space-y-3">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold tracking-wider" dir="ltr">{o.code}</p>
                  <p className="truncate text-xs text-muted-foreground">{o.customerName} · {o.commune}</p>
                </div>
                <div className="text-end">
                  <p className="font-bold text-primary">{formatPrice(o.total, locale)}</p>
                  <span
                    className={cn(
                      "badge mt-1",
                      o.status === "DELIVERED" && "bg-primary/10 text-primary",
                      o.status === "PENDING" && "bg-amber-500/15 text-amber-600",
                      o.status === "SHIPPED" && "bg-sky-500/15 text-sky-600",
                      (o.status === "CANCELLED" || o.status === "RETURNED") && "bg-red-500/15 text-red-500"
                    )}
                  >
                    {t.statuses[o.status as keyof typeof t.statuses]}
                  </span>
                </div>
              </li>
            ))}
            {recent.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">{t.admin.empty}</li>}
          </ul>
        </section>

        <section className="card-soft p-5">
          <h2 className="mb-4 font-display font-bold">{t.admin.topBooks}</h2>
          <ul className="space-y-3">
            {topBooks.map((b, i) => (
              <li key={b.id} className="flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3">
                <span className="w-5 text-sm font-bold text-muted-foreground">{i + 1}</span>
                <span className="h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={b.cover} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-medium">
                    {locale === "ar" ? b.titleAr || b.title : b.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {b.salesCount} {t.admin.sold}
                  </span>
                </span>
                <span className="text-sm font-bold text-primary">{formatPrice(b.price, locale)}</span>
              </li>
            ))}
            {topBooks.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">{t.admin.empty}</li>}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            {t.admin.totalBooks}: {booksCount}
          </p>
        </section>
      </div>

      <p className="text-xs text-muted-foreground">{formatDate(new Date().toISOString(), locale)}</p>
    </div>
  );
}
