import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/db";
import { OrdersTable } from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.admin.orders} · Medical Books DZ`, robots: { index: false } };
}

export default async function AdminOrders({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      code: true,
      customerName: true,
      phone: true,
      wilaya: true,
      commune: true,
      total: true,
      itemsCount: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold">{t.admin.orders}</h2>
      <OrdersTable
        orders={orders.map((o) => ({
          ...o,
          status: o.status as string,
          createdAt: o.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
