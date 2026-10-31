import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, LogOut, Package, Percent, Tag, Truck, Users } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { isAdminAuthenticated } from "@/lib/auth";
import { adminLogout } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;

  if (!isAdminAuthenticated()) redirect(`/${locale}/admin/login`);

  const t = getDictionary(locale);
  const links = [
    { href: `/${locale}/admin`, label: t.admin.dashboard, icon: LayoutDashboard },
    { href: `/${locale}/admin/orders`, label: t.admin.orders, icon: Package },
    { href: `/${locale}/admin/products`, label: t.admin.products, icon: Tag },
    { href: `/${locale}/admin/promos`, label: t.admin.promos, icon: Percent },
    { href: `/${locale}/admin/shipping`, label: t.admin.shippingCompanies, icon: Truck },
    { href: `/${locale}/admin/newsletter`, label: t.admin.newsletter, icon: Users },
  ];

  return (
    <div className="container-store py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-extrabold">{t.admin.title}</h1>
        <form action={adminLogout}>
          <button type="submit" className="btn-ghost text-sm">
            <LogOut className="h-4 w-4" />
            {t.admin.logout}
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[210px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
