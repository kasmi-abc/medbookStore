import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/db";
import { ShippingManager } from "@/components/admin/shipping-manager";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.admin.shippingCompanies} · Medical Books DZ`, robots: { index: false } };
}

export default async function AdminShipping({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const companies = await prisma.shippingCompany.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      nameAr: true,
      nameFr: true,
      code: true,
      trackingUrl: true,
      phone: true,
      active: true,
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold">{t.admin.shippingCompanies}</h2>
      <ShippingManager companies={companies} />
    </div>
  );
}
