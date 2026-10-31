import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { TrackClient } from "@/components/track-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: t.track.title, description: t.track.subtitle };
}

export default async function TrackPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const t = getDictionary(locale);

  return (
    <div className="container-store py-12">
      <div className="mb-10 text-center">
        <h1 className="section-title">{t.track.title}</h1>
        <p className="section-sub">{t.track.subtitle}</p>
      </div>
      <Suspense>
        <TrackClient />
      </Suspense>
    </div>
  );
}
