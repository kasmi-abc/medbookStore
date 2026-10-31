import type { Metadata } from "next";
import { Clock, Home, Package, Wallet } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.shipping.title} · Medical Books DZ` };
}

export default async function ShippingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const blocks = [
    { icon: Package, h: t.shipping.stopDeskTitle, p: t.shipping.stopDeskText },
    { icon: Home, h: t.shipping.homeTitle, p: t.shipping.homeText },
    { icon: Wallet, h: t.shipping.feesTitle, p: t.shipping.feesText },
    { icon: Clock, h: t.shipping.timesTitle, p: t.shipping.timesText },
  ];

  return (
    <div className="container-store py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="section-title">{t.shipping.title}</h1>
        <p className="section-sub">{t.shipping.p1}</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
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
