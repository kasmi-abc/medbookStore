import type { Metadata } from "next";
import { CalendarClock, ListChecks, RotateCcw, MessageCircle } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.returns.title} · Medical Books DZ` };
}

export default async function ReturnsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const blocks = [
    { icon: CalendarClock, h: t.returns.windowTitle, p: t.returns.windowText },
    { icon: ListChecks, h: t.returns.conditionsTitle, p: `${t.returns.condition1} ${t.returns.condition2} ${t.returns.condition3}` },
    { icon: MessageCircle, h: t.returns.howTitle, p: t.returns.howText },
  ];

  return (
    <div className="container-store py-14">
      <div className="mx-auto max-w-3xl text-center">
        <RotateCcw className="mx-auto h-10 w-10 text-primary" />
        <h1 className="section-title mt-4">{t.returns.title}</h1>
        <p className="section-sub">{t.returns.p1}</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
        {blocks.map((b) => (
          <article key={b.h} className="card-soft p-6">
            <b.icon className="h-6 w-6 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">{b.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.p}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
