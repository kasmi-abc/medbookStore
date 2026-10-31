import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Hash, Languages, Library, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import {
  formatPrice,
  localizedAuthor,
  localizedDescription,
  localizedTitle,
  parseFormats,
  priceForFormat,
} from "@/lib/book";
import { BookCard, type BookCardData } from "@/components/book-card";
import { Stars } from "@/components/stars";
import { AddToCart } from "@/components/shop/add-to-cart";
import { LookInside } from "@/components/shop/look-inside";
import { ReviewsSection } from "@/components/shop/reviews";
import { SeriesBuyButton } from "@/components/shop/series-buy-button";
import { ShareButton } from "@/components/shop/share-button";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const book = await prisma.book.findUnique({ where: { slug } }).catch(() => null);
  if (!book) return { title: "Book" };
  const title = localizedTitle(book, locale);
  return {
    title,
    description: localizedDescription(book, locale).slice(0, 180),
    openGraph: { title, images: [book.cover] },
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = getDictionary(locale);

  const book = await prisma.book
    .findUnique({
      where: { slug },
      include: {
        category: true,
        publisher: true,
        series: { include: { books: { orderBy: { seriesOrder: "asc" } } } },
        reviews: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    })
    .catch(() => null);

  if (!book) notFound();

  const formats = parseFormats(book.formats);
  const mainPrice = priceForFormat(book.price, formats[0], book.discountPercent);

  let related: BookCardData[] = [];
  try {
    related = await prisma.book.findMany({
      where: { categorySlug: book.categorySlug, id: { not: book.id } },
      select: cardSelect,
      orderBy: { rating: "desc" },
      take: 4,
    });
    if (related.length < 4) {
      const extra = await prisma.book.findMany({
        where: { bestSeller: true, id: { notIn: [book.id, ...related.map((r) => r.id)] } },
        select: cardSelect,
        orderBy: { salesCount: "desc" },
        take: 4 - related.length,
      });
      related = [...related, ...extra];
    }
  } catch {
    related = [];
  }

  const go = (path: string) => `/${locale}${path}`;

  const categoryName = book.category
    ? locale === "ar"
      ? book.category.nameAr
      : locale === "fr"
        ? book.category.nameFr
        : book.category.name
    : "—";

  const details: { label: string; value: string; icon?: React.ReactNode }[] = [
    { label: t.product.author, value: localizedAuthor(book, locale) },
    { label: t.product.publisher, value: book.publisher?.name ?? "—" },
    { label: t.product.categoryLabel, value: categoryName },
    { label: t.editions.edition, value: book.edition ? `${book.edition}` : "—" },
    { label: t.editions.editionYear, value: book.editionYear ? `${book.editionYear}` : String(book.year ?? "—") },
    ...(book.studyYear ? [{ label: t.shop.studyYear, value: t.studyYears[book.studyYear] }] : []),
    { label: t.product.pages, value: book.pages ? `${book.pages}` : "—" },
    { label: t.product.languageLabel, value: book.originLanguage },
    { label: t.product.isbn, value: book.isbn ?? "—" },
  ];

  const seriesBooks = book.series
    ? book.series.books.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        titleAr: b.titleAr,
        titleFr: b.titleFr,
        cover: b.cover,
        price: b.price,
        discountPercent: b.discountPercent,
      }))
    : [];

  return (
    <div className="container-store py-10">
      <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={go("/")} className="hover:text-primary">{t.nav.home}</Link>
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        <Link href={go(`/shop?category=${encodeURIComponent(book.categorySlug ?? "")}`)} className="hover:text-primary">
          {categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        <span className="truncate text-foreground">{localizedTitle(book, locale)}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="book-cover aspect-[3/4] w-full shadow-xl">
            <img src={book.cover} alt={localizedTitle(book, locale)} className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 space-y-2">
            <LookInside sampleText={book.sampleText} title={localizedTitle(book, locale)} />
            <ShareButton url={`/${locale}/book/${book.slug}`} />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {book.discountPercent ? <span className="badge bg-accent text-accent-foreground">-{book.discountPercent}%</span> : null}
            {book.isNew ? <span className="badge bg-primary text-primary-foreground">{t.common.new}</span> : null}
            {book.bestSeller ? <span className="badge bg-foreground text-background">{t.common.best}</span> : null}
          </div>

          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {localizedTitle(book, locale)}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {t.common.by} {localizedAuthor(book, locale)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2">
              <Stars value={book.rating} size="md" />
              <span className="text-sm font-semibold">{book.rating.toFixed(1)}</span>
              <a href="#reviews" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                ({book.reviewsCount} {t.common.reviews})
              </a>
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {t.product.soldCount.replace("{n}", String(book.salesCount))}
            </span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-4xl font-extrabold text-primary">{formatPrice(mainPrice, locale)}</span>
            {book.oldPrice && book.oldPrice > mainPrice ? (
              <span className="pb-1 text-lg text-muted-foreground line-through">{formatPrice(book.oldPrice, locale)}</span>
            ) : null}
            <span className="pb-1.5 text-sm text-muted-foreground">
              {book.inStock ? `• ${t.product.inStock}` : `• ${t.product.outOfStock}`}
            </span>
          </div>

          <div className="mt-8">
            <AddToCart
              book={{
                id: book.id,
                slug: book.slug,
                title: book.title,
                titleAr: book.titleAr,
                cover: book.cover,
                price: book.price,
                discountPercent: book.discountPercent,
                inStock: book.inStock,
                formats: book.formats,
              }}
            />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">{t.product.freeShipping} • {t.checkout.cod}</p>

          {book.series && book.seriesOrder ? (
            <SeriesBuyButton
              seriesId={book.series.id}
              seriesTitle={locale === "ar" ? book.series.nameAr : locale === "fr" ? book.series.nameFr : book.series.name}
              bundlePrice={book.series.bundlePrice}
              cover={book.series.cover ?? book.cover}
              books={seriesBooks}
            />
          ) : null}

          <div className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <Library className="h-5 w-5 text-primary" />
              {t.product.details}
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-3xl border border-border/70 bg-card p-6 text-sm sm:grid-cols-3">
              {details.map((d) => (
                <div key={d.label}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{d.label}</dt>
                  <dd className="mt-0.5 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {d.label === t.product.isbn ? <Hash className="h-3.5 w-3.5 text-primary" /> : null}
                      {d.label === t.product.languageLabel ? <Languages className="h-3.5 w-3.5 text-primary" /> : null}
                      {d.value}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 font-display text-xl font-bold">{t.product.description}</h2>
            <p className="whitespace-pre-line text-[15px] leading-8 text-foreground/85">
              {localizedDescription(book, locale)}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">{t.product.recommendations}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}

      <ReviewsSection
        bookId={book.id}
        lang={locale}
        reviews={book.reviews.map((r) => ({
          id: r.id,
          name: r.name,
          city: r.city,
          stars: r.stars,
          comment: r.comment,
          helpful: r.helpful,
          verified: r.verified,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
