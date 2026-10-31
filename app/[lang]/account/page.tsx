import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { AccountClient } from "@/components/account-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.account.title} · Medical Books DZ` };
}

export default async function AccountPage({ params }: { params: Promise<{ lang: string }> }) {
  await params;
  return (
    <Suspense>
      <AccountClient />
    </Suspense>
  );
}
