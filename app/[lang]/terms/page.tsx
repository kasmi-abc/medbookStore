import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.terms.title} · Medical Books DZ` };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  return (
    <div className="container-store py-14">
      <div className="mx-auto max-w-3xl text-center">
        <FileText className="mx-auto h-10 w-10 text-primary" />
        <h1 className="section-title mt-4">{t.terms.title}</h1>
      </div>
      <div className="mx-auto mt-10 max-w-3xl space-y-5">
        {t.terms.sections.map((s) => (
          <section key={s.h} className="card-soft p-6">
            <h2 className="font-display text-lg font-bold">{s.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
