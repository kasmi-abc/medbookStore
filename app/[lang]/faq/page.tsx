import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { FaqAccordion } from "@/components/faq-accordion";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.faq.title} · Medical Books DZ` };
}

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  return (
    <div className="container-store py-14">
      <div className="mx-auto max-w-3xl text-center">
        <HelpCircle className="mx-auto h-10 w-10 text-primary" />
        <h1 className="section-title mt-4">{t.faq.title}</h1>
        <p className="section-sub">{t.faq.subtitle}</p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <FaqAccordion items={t.faq.items} />
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        {t.contact.subtitle}{" "}
        <Link href={`/${locale}/contact`} className="font-semibold text-primary hover:underline">
          {t.nav.contact}
        </Link>
      </p>
    </div>
  );
}
