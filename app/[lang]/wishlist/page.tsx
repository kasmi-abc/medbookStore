import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { WishlistClient } from "@/components/wishlist-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: t.wishlist.title };
}

export default async function WishlistPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  void lang;
  return (
    <Suspense>
      <WishlistClient />
    </Suspense>
  );
}
