import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { isAdminAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.admin.signIn} · Medical Books DZ`, robots: { index: false } };
}

export default async function AdminLoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  if (await isAdminAuthenticated()) redirect(`/${locale}/admin`);

  return (
    <div className="container-store py-20">
      <LoginForm />
    </div>
  );
}
