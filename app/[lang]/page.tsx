import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BadgePercent,
  BookOpenCheck,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { BookCard, type BookCardData } from "@/components/book-card";
import { SectionHeader } from "@/components/section-header";
import { NewsletterForm } from "@/components/newsletter-form";
import { Stars } from "@/components/stars";
import { Reveal } from "@/components/reveal";
import { getIcon } from "@/lib/lucide-map";

export const revalidate = 300;

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  titleAr: true,
  titleFr: true,
  author: true,
  authorAr: true,
  price: true,
  oldPrice: true,
  discountPercent: true,
  cover: true,
  rating: true,
  reviewsCount: true,
  bestSeller: true,
  isNew: true,
  inStock: true,
  formats: true,
} as const;

const whyIcons = [ShieldCheck, Truck, Wallet, BookOpenCheck];

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = getDictionary(locale);

  let featured: BookCardData[] = [];
  let best: BookCardData[] = [];
  let fresh: BookCardData[] = [];
  let offers: BookCardData[] = [];
  let categories: { slug: string; name: string; nameAr: string; nameFr: string; icon: string; _count: { books: number } }[] = [];
  let series: {
    id: string;
    slug: string;
    name: string;
    nameAr: string;
    nameFr: string;
    bundlePrice: number;
    oldPrice: number | null;
    cover: string | null;
    books: { id: string; slug: string; title: string; titleAr: string; titleFr: string; cover: string }[];
  }[] = [];
  let reviews: { id: string; name: string; city: string | null; stars: number; comment: string }[] = [];

  try {
    [featured, best, fresh, offers] = await Promise.all([
      prisma.book.findMany({ where: { featured: true }, select: cardSelect, orderBy: { salesCount: "desc" }, take: 8 }),
      prisma.book.findMany({ where: { bestSeller: true }, select: cardSelect, orderBy: { salesCount: "desc" }, take: 8 }),
      prisma.book.findMany({ where: { isNew: true }, select: cardSelect, orderBy: { createdAt: "desc" }, take: 8 }),
      prisma.book.findMany({ where: { discountPercent: { not: null } }, select: cardSelect, orderBy: { discountPercent: "desc" }, take: 8 }),
    ]);
    const catRows = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true, nameAr: true, nameFr: true, icon: true, parentSlug: true },
    });
    const bookCats = await prisma.book.findMany({ select: { categorySlug: true } });
    const countMap = new Map<string, number>();
    for (const b of bookCats) {
      if (!b.categorySlug) continue;
      countMap.set(b.categorySlug, (countMap.get(b.categorySlug) ?? 0) + 1);
    }
    const descendants = (slug: string): string[] => [
      slug,
      ...catRows.filter((c) => c.parentSlug === slug).flatMap((c) => descendants(c.slug)),
    ];
    categories = catRows
      .filter((c) => c.parentSlug === null)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        nameAr: c.nameAr,
        nameFr: c.nameFr,
        icon: c.icon,
        _count: { books: descendants(c.slug).reduce((n, s) => n + (countMap.get(s) ?? 0), 0) },
      }));
    const seriesRows = await prisma.series.findMany({
      include: { books: { select: { id: true, slug: true, title: true, titleAr: true, titleFr: true, cover: true }, orderBy: { seriesOrder: "asc" } } },
      take: 3,
    });
    series = seriesRows;
    reviews = await prisma.review.findMany({ orderBy: { helpful: "desc" }, take: 6, select: { id: true, name: true, city: true, stars: true, comment: true } });
  } catch {
  }

  const go = (path: string) => `/${locale}${path}`;
  const catLabel = (c: { name: string; nameAr: string; nameFr: string }) =>
    locale === "ar" ? c.nameAr : locale === "fr" ? c.nameFr : c.name;
  const seriesLabel = (s: { name: string; nameAr: string; nameFr: string }) =>
    locale === "ar" ? s.nameAr : locale === "fr" ? s.nameFr : s.name;

  return (
    <>
      <section className="hero-gradient">
        <div className="container-store grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up lg:col-start-1 lg:row-start-1">
            <span className="badge border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t.home.heroBadge}
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              {t.home.heroTitle}
              <br />
              <span className="bg-gradient-to-r from-primary via-brand-600 to-brand-700 bg-clip-text text-transparent">
                {t.home.heroAccent}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.home.heroSubtitle}
            </p>
          </div>

          <div
            className="relative mx-auto w-full max-w-md animate-fade-up lg:col-start-2 lg:row-start-1 lg:row-span-2"
            style={{ animationDelay: "120ms" }}
          >
            <div className="grid grid-cols-3 gap-4">
              {(featured.length ? featured : []).slice(0, 6).map((b, i) => (
                <div
                  key={b.id}
                  className="book-cover aspect-[3/4] shadow-lg"
                  style={{ transform: `translateY(${i % 2 === 0 ? 0 : 28}px) rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
                >
                  <img src={b.cover} alt="" className="h-full w-full object-cover" loading="eager" />
                </div>
              ))}
            </div>
            <div className="absolute -bottom-4 start-0 flex max-w-full items-center gap-2 rounded-2xl border border-border/70 bg-card/90 px-4 py-3 shadow-xl backdrop-blur sm:-bottom-5 sm:-start-5">
              <Truck className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-semibold">{t.product.freeShipping}</p>
                <p className="text-xs text-muted-foreground">{t.payment.cod}</p>
              </div>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center gap-3 animate-fade-up lg:col-start-1 lg:row-start-2"
            style={{ animationDelay: "240ms" }}
          >
            <Link href={go("/shop")} className="btn-primary px-7 py-3 text-base">
              {t.home.ctaExplore}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link href={go("/shop?tag=new")} className="btn-secondary px-7 py-3 text-base">
              {t.home.ctaNew}
            </Link>
          </div>

          <dl
            className="mx-auto grid max-w-lg grid-cols-2 gap-6 animate-fade-up sm:grid-cols-4 lg:col-span-2 lg:row-start-3"
            style={{ animationDelay: "360ms" }}
          >
            {[
              { label: t.home.statsBooks, value: "37+" },
              { label: t.home.statsReaders, value: "12k+" },
              { label: t.home.statsWilayas, value: "69" },
              { label: t.home.statsRating, value: "4.8" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 font-display text-2xl font-bold text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-store py-14">
        <Reveal>
          <SectionHeader title={t.home.categoriesTitle} sub={t.home.categoriesSub} href={go("/shop")} linkLabel={t.nav.viewAll} />
        </Reveal>
        <Reveal stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => {
            const Icon = getIcon(c.icon);
            return (
              <Link
                key={c.slug}
                href={go(`/shop?category=${encodeURIComponent(c.slug)}`)}
                className="group card-soft flex flex-col items-center gap-3 p-5 text-center transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="w-full min-w-0">
                  <span className="block break-words font-semibold leading-tight">{catLabel(c)}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{c._count.books} {t.shop.results}</span>
                </span>
              </Link>
            );
          })}
        </Reveal>
      </section>

      {featured.length > 0 && (
        <section className="container-store py-10">
          <Reveal>
            <SectionHeader title={t.home.featuredTitle} sub={t.home.featuredSub} href={go("/shop")} linkLabel={t.nav.viewAll} />
          </Reveal>
          <Reveal stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, 8).map((b, i) => (
              <BookCard key={b.id} book={b} priority={i < 4} />
            ))}
          </Reveal>
        </section>
      )}

      <section className="container-store py-10">
        <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-brand-700/40 bg-gradient-to-br from-[#16130a] via-[#241d00] to-[#0b0a06] p-8 text-[#ffd400] sm:p-12">
          <div className="absolute -end-10 -top-10 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
          <div className="relative max-w-2xl">
            <BadgePercent className="h-8 w-8 text-accent" />
            <h3 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{t.home.ctaBannerTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed opacity-90 sm:text-base">{t.home.ctaBannerText}</p>
            <Link
              href={go("/shop?category=human-medicine")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-lg transition hover:scale-[1.03]"
            >
              {t.home.ctaBannerBtn}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
        </Reveal>
      </section>

      {best.length > 0 && (
        <section className="container-store py-10">
          <Reveal>
            <SectionHeader title={t.home.bestTitle} sub={t.home.bestSub} href={go("/shop?tag=best")} linkLabel={t.nav.viewAll} />
          </Reveal>
          <Reveal stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {best.slice(0, 8).map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </Reveal>
        </section>
      )}

      {series.length > 0 && (
        <section className="container-store py-10">
          <Reveal>
            <SectionHeader title={t.home.seriesTitle} sub={t.home.seriesSub} href={go("/bundles")} linkLabel={t.nav.viewAll} />
          </Reveal>
          <Reveal stagger className="grid gap-5 lg:grid-cols-3">
            {series.map((s) => (
              <Link
                key={s.id}
                href={go(`/series/${s.slug}`)}
                className="group card-soft flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex gap-2 bg-muted/60 p-4">
                  {s.books.slice(0, 3).map((b) => (
                    <span key={b.id} className="book-cover aspect-[3/4] w-1/3">
                      <img src={b.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </span>
                  ))}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-bold transition group-hover:text-primary">{seriesLabel(s)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.books.length} × {t.nav.explore}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "en-US").format(s.bundlePrice)} {t.common.currency}
                    </span>
                    {s.oldPrice ? (
                      <span className="text-sm text-muted-foreground line-through">
                        {new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "en-US").format(s.oldPrice)} {t.common.currency}
                      </span>
                    ) : null}
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {t.home.buySeries}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:rotate-180" />
                  </span>
                </div>
              </Link>
            ))}
          </Reveal>
        </section>
      )}

      <section className="container-store grid gap-10 py-10 lg:grid-cols-2">
        {fresh.length > 0 && (
          <Reveal>
            <SectionHeader title={t.home.newTitle} sub={t.home.newSub} href={go("/shop?tag=new")} linkLabel={t.nav.viewAll} />
            <Reveal stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {fresh.slice(0, 3).map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </Reveal>
          </Reveal>
        )}
        {offers.length > 0 && (
          <Reveal>
            <SectionHeader title={t.home.offersTitle} sub={t.home.offersSub} href={go("/shop?sale=1")} linkLabel={t.nav.viewAll} />
            <Reveal stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {offers.slice(0, 3).map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </Reveal>
          </Reveal>
        )}
      </section>

      <section className="container-store py-14">
        <Reveal>
          <SectionHeader title={t.home.whyTitle} sub={t.home.whySub} />
        </Reveal>
        <Reveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.whyItems.map((item, i) => {
            const Icon = whyIcons[i % whyIcons.length];
            return (
              <div key={item.title} className="card-soft p-6 transition hover:-translate-y-1 hover:shadow-md">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            );
          })}
        </Reveal>
      </section>

      {reviews.length > 0 && (
        <section className="container-store py-10">
          <Reveal>
            <SectionHeader title={t.home.reviewsTitle} sub={t.home.reviewsSub} />
          </Reveal>
          <Reveal stagger className="grid gap-5 md:grid-cols-3">
            {reviews.slice(0, 3).map((r) => (
              <figure key={r.id} className="card-soft relative p-6 transition hover:-translate-y-1 hover:shadow-md">
                <Quote className="absolute end-5 top-5 h-8 w-8 text-primary/15" />
                <Stars value={r.stars} />
                <blockquote className="mt-3 text-sm leading-relaxed text-foreground/85">{r.comment}</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">
                  {r.name}
                  {r.city ? <span className="font-normal text-muted-foreground"> — {r.city}</span> : null}
                </figcaption>
              </figure>
            ))}
          </Reveal>
          <div className="mt-8 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">4.8</span>/5 — 500+ {t.common.reviews}
          </div>
        </section>
      )}

      <section className="container-store py-14">
        <Reveal>
        <div className="card-soft relative overflow-hidden p-8 text-center sm:p-14">
          <div className="absolute -start-16 -top-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -end-16 -bottom-16 h-52 w-52 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{t.home.newsletterTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{t.home.newsletterSub}</p>
            <Suspense>
              <NewsletterForm className="mx-auto mt-7" />
            </Suspense>
          </div>
        </div>
        </Reveal>
      </section>
    </>
  );
}
