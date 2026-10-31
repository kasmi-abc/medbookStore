import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/db";
import { PromosManager } from "@/components/admin/promos-manager";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.admin.promos} · Medical Books DZ`, robots: { index: false } };
}

export default async function AdminPromos({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const promos = await prisma.promoCode.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold">{t.admin.promos}</h2>
      <PromosManager
        promos={promos.map((p) => ({
          code: p.code,
          percent: p.percent,
          active: p.active,
          expiresAt: p.expiresAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
