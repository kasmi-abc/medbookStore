import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.admin.newsletter} · Medical Books DZ`, robots: { index: false } };
}

export default async function AdminNewsletter({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const emails = await prisma.newsletter.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">{t.admin.newsletter}</h2>
        <span className="badge bg-primary/10 text-primary">{emails.length}</span>
      </div>

      {emails.length === 0 ? (
        <p className="card-soft py-12 text-center text-sm text-muted-foreground">{t.admin.empty}</p>
      ) : (
        <ul className="card-soft divide-y divide-border/60">
          {emails.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <span className="font-medium" dir="ltr">{e.email}</span>
              <span className="text-xs text-muted-foreground">{formatDate(e.createdAt.toISOString(), locale)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
