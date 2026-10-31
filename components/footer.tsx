import Link from "next/link";
import {
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { NewsletterForm } from "@/components/newsletter-form";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

const SOCIAL = [
  { href: "https://www.instagram.com/medical.books.dz/", label: "Instagram", Icon: Instagram },
  {
    href: "https://www.facebook.com/107350227737347?ref=PRODASH_UPSELL_xav_ig_profile_page_web",
    label: "Facebook",
    Icon: Facebook,
  },
];

export async function Footer({ t, lang }: { t: Dict; lang: Locale }) {
  let categories: { slug: string; name: string; nameAr: string; nameFr: string }[] = [];
  try {
    categories = await prisma.category.findMany({ where: { parentSlug: null }, orderBy: { name: "asc" }, take: 6 });
  } catch {
    categories = [];
  }

  const go = (path: string) => `/${lang}${path}`;
  const catLabel = (c: { name: string; nameAr: string; nameFr: string }) =>
    lang === "ar" ? c.nameAr : lang === "fr" ? c.nameFr : c.name;

  return (
    <footer className="mt-20 border-t bg-card/50">
      <div className="container-store py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-1 ring-border/70">
                <img src="/logo.jpg" alt={t.brand.name} className="h-full w-full object-cover" />
              </span>
              <span className="font-display text-lg font-bold">
                Medical <span className="text-brand-600 dark:text-brand-300">Books</span> DZ
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{t.footer.aboutText}</p>
            <div className="mt-4 flex items-center gap-2">
              {SOCIAL.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition hover:border-primary hover:text-primary"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground/80">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link className="transition hover:text-primary" href={go("/")}>{t.nav.home}</Link></li>
              <li><Link className="transition hover:text-primary" href={go("/shop")}>{t.nav.explore}</Link></li>
              <li><Link className="transition hover:text-primary" href={go("/shop?tag=best")}>{t.nav.bestSellers}</Link></li>
              <li><Link className="transition hover:text-primary" href={go("/shop?tag=new")}>{t.nav.newReleases}</Link></li>
              <li><Link className="transition hover:text-primary" href={go("/shop?sale=1")}>{t.nav.offers}</Link></li>
              <li><Link className="transition hover:text-primary" href={go("/bundles")}>{t.nav.bundles}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground/80">
              {t.nav.categories}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    className="transition hover:text-primary"
                    href={go(`/shop?category=${encodeURIComponent(c.slug)}`)}
                  >
                    {catLabel(c)}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="font-medium text-primary" href={go("/shop")}>
                  {t.nav.viewAll} →
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground/80">
              {t.footer.customerCare}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link className="transition hover:text-primary" href={go("/faq")}>{t.footer.faq}</Link></li>
              <li><Link className="transition hover:text-primary" href={go("/shipping")}>{t.footer.shipping}</Link></li>
              <li><Link className="transition hover:text-primary" href={go("/returns")}>{t.footer.returns}</Link></li>
              <li><Link className="transition hover:text-primary" href={go("/terms")}>{t.footer.terms}</Link></li>
              <li><Link className="transition hover:text-primary" href={go("/privacy")}>{t.footer.privacy}</Link></li>
              <li><Link className="transition hover:text-primary" href={go("/track")}>{t.footer.trackOrder}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground/80">
              {t.footer.contactTitle}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {t.footer.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href={`tel:${t.footer.phone.replace(/\s/g, "")}`} className="hover:text-primary" dir="ltr">
                  {t.footer.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${t.footer.email}`} className="hover:text-primary" dir="ltr">
                  {t.footer.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                {t.footer.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 lg:flex-row lg:items-center">
          <div>
            <h3 className="font-display text-lg font-bold sm:text-xl">{t.footer.newsletter}</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t.footer.newsletterText}</p>
          </div>
          <NewsletterForm />
        </div>

        <div className="mt-10 flex flex-col justify-between gap-2 border-t pt-8 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} {t.brand.name}. {t.footer.rights}
          </span>
          <span>{t.footer.madeWith}</span>
        </div>
      </div>
    </footer>
  );
}
