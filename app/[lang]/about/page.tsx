import type { Metadata } from "next";
import { CheckCircle2, Compass, Handshake, Timer } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.about.title} · Medical Books DZ`, description: t.about.p1 };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const values = [
    { text: t.about.value1, icon: CheckCircle2 },
    { text: t.about.value2, icon: Compass },
    { text: t.about.value3, icon: Handshake },
    { text: t.about.value4, icon: Timer },
  ];

  return (
    <div className="container-store py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="section-title">{t.about.title}</h1>
        <div className="mt-6 space-y-4 text-start leading-relaxed text-muted-foreground">
          <p>{t.about.p1}</p>
          <p>{t.about.p2}</p>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-primary/20 bg-primary/5 p-8">
        <h2 className="font-display text-xl font-bold text-primary">{t.about.missionTitle}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{t.about.missionText}</p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <h2 className="font-display text-xl font-bold">{t.about.valuesTitle}</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <li key={v.text} className="card-soft flex items-start gap-3 p-5">
              <v.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm leading-relaxed text-muted-foreground">{v.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
