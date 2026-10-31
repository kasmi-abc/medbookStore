import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { BookCard, type BookCardData } from "@/components/book-card";
import { ShopFilters, type ShopFilterData } from "@/components/shop/shop-filters";
import { SortControl } from "@/components/shop/sort-control";

export const revalidate = 120;

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

type SP = Record<string, string | string[] | undefined>;

function first(sp: SP, key: string): string {
  const v = sp[key];
  return typeof v === "string" ? v : "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = getDictionary(locale);
  return { title: t.shop.title, description: t.shop.subtitle };
}

const PAGE_SIZE = 12;

const STUDY_YEARS = [
  "YEAR_1",
  "YEAR_2",
  "YEAR_3",
  "YEAR_4",
  "YEAR_5",
  "YEAR_6",
  "YEAR_7",
  "INTERNSHIP",
  "SPECIALIZATION",
  "BOARD_PREP",
  "CONTINUING_ED",
];

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SP>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = getDictionary(locale);

  const category = first(sp, "category");
  const author = first(sp, "author");
  const publisher = first(sp, "publisher");
  const year = first(sp, "year");
  const study = first(sp, "study");
  const rating = first(sp, "rating");
  const price = first(sp, "price");
  const bookLang = first(sp, "lang");
  const format = first(sp, "format");
  const sale = first(sp, "sale");
  const tag = first(sp, "tag");
  const q = first(sp, "q");
  const sort = first(sp, "sort") || "newest";
  const page = Math.max(1, Number(first(sp, "page")) || 1);

  const where: Record<string, unknown> = {};
  if (author) where.author = author;
  if (publisher) where.publisher = { name: publisher };
  if (year) where.year = Number(year);
  if (study && STUDY_YEARS.includes(study)) where.studyYear = study;
  if (rating) where.rating = { gte: Number(rating) };
  if (price) where.price = { lte: Number(price) };
  if (bookLang) where.originLanguage = bookLang;
  if (sale) where.discountPercent = { not: null };
  if (tag === "best") where.bestSeller = true;
  if (tag === "new") where.isNew = true;
  if (format) {
    where.formats = { contains: format };
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { titleAr: { contains: q } },
      { titleFr: { contains: q, mode: "insensitive" } },
      { author: { contains: q, mode: "insensitive" } },
      { isbn: { contains: q } },
    ];
  }

  const orderBy: Record<string, string> =
    sort === "priceAsc"
      ? { price: "asc" }
      : sort === "priceDesc"
        ? { price: "desc" }
        : sort === "rating"
          ? { rating: "desc" }
          : sort === "best"
            ? { salesCount: "desc" }
            : { createdAt: "desc" };

  let books: BookCardData[] = [];
  let total = 0;
  let filters: ShopFilterData = { categories: [], authors: [], publishers: [], years: [], studyYears: [], maxPrice: 15000 };

  try {
    const catRows = await prisma.category.findMany({ select: { slug: true, parentSlug: true } });
    if (category) {
      const kids = new Map<string, string[]>();
      for (const c of catRows) {
        if (!c.parentSlug) continue;
        const arr = kids.get(c.parentSlug);
        if (arr) arr.push(c.slug);
        else kids.set(c.parentSlug, [c.slug]);
      }
      const expand = (slug: string): string[] => [slug, ...(kids.get(slug) ?? []).flatMap((s) => expand(s))];
      where.categorySlug = { in: expand(category) };
    }
    [books, total, filters] = await Promise.all([
      prisma.book.findMany({
        where,
        select: cardSelect,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.book.count({ where }),
      (async () => {
        const [cats, authors, pubs, years, studies, agg] = await Promise.all([
          prisma.category.findMany({
            orderBy: { name: "asc" },
            select: { slug: true, name: true, nameAr: true, nameFr: true, parentSlug: true },
          }),
          prisma.book.findMany({ distinct: ["author"], select: { author: true }, orderBy: { author: "asc" } }),
          prisma.publisher.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
          prisma.book.findMany({ distinct: ["year"], select: { year: true }, orderBy: { year: "desc" } }),
          prisma.book.findMany({ distinct: ["studyYear"], select: { studyYear: true } }),
          prisma.book.aggregate({ _max: { price: true } }),
        ]);
        const ordered: { slug: string; name: string; nameAr: string; nameFr: string; parentSlug: string | null }[] = [];
        const pushTree = (parent: string | null) => {
          for (const c of cats) {
            if (c.parentSlug !== parent) continue;
            ordered.push(c);
            pushTree(c.slug);
          }
        };
        pushTree(null);
        return {
          categories: ordered,
          authors: authors.map((a) => a.author),
          publishers: pubs.map((p) => p.name),
          years: years.map((y) => y.year).filter(Boolean) as number[],
          studyYears: studies.map((s) => s.studyYear).filter((s) => s !== null),
          maxPrice: agg._max.price ?? 15000,
        };
      })(),
    ]);
  } catch {}

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const go = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && v) params.set(k, v);
    }
    params.set("page", String(p));
    return `/${locale}/shop?${params.toString()}`;
  };

  const pageTitle =
    tag === "best"
      ? t.home.bestTitle
      : tag === "new"
        ? t.home.newTitle
        : sale
          ? t.home.offersTitle
          : category
            ? filters.categories.find((c) => c.slug === category)
              ? locale === "ar"
                ? filters.categories.find((c) => c.slug === category)?.nameAr
                : locale === "fr"
                  ? filters.categories.find((c) => c.slug === category)?.nameFr
                  : filters.categories.find((c) => c.slug === category)?.name
              : t.shop.title
            : t.shop.title;

  return (
    <div className="container-store py-10">
      <div className="mb-8">
        <h1 className="section-title">{pageTitle ?? t.shop.title}</h1>
        <p className="section-sub">{t.shop.subtitle}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <ShopFilters data={filters} />

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{total}</span> {t.shop.results}
            </p>
            <SortControl />
          </div>

          {books.length === 0 ? (
            <div className="card-soft p-14 text-center">
              <h2 className="font-display text-xl font-bold">{t.shop.noResultsTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.shop.noResultsText}</p>
              <Link href={`/${locale}/shop`} className="btn-primary mt-6">
                {t.shop.clear}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {books.map((b, i) => (
                <BookCard key={b.id} book={b} priority={i < 4} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="pagination">
              {page > 1 ? (
                <Link href={go(page - 1)} className="btn-secondary">
                  ← {t.shop.prev}
                </Link>
              ) : (
                <span className="btn-secondary pointer-events-none opacity-40">← {t.shop.prev}</span>
              )}
              <span className="px-3 text-sm text-muted-foreground">
                {t.shop.page} {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={go(page + 1)} className="btn-secondary">
                  {t.shop.next} →
                </Link>
              ) : (
                <span className="btn-secondary pointer-events-none opacity-40">{t.shop.next} →</span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
