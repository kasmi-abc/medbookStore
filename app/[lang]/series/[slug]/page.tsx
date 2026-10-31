import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Layers, Tag } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { BookCard, type BookCardData } from "@/components/book-card";
import { SeriesBuyButton } from "@/components/shop/series-buy-button";
import { formatPrice, localizedDescription, localizedTitle } from "@/lib/book";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);
  const series = await prisma.series.findUnique({ where: { slug } }).catch(() => null);
  if (!series) return { title: t.nav.bundles };
  return {
    title: `${localizedTitle({ title: series.name, titleAr: series.nameAr, titleFr: series.nameFr }, locale)} · Medical Books DZ`,
    description: series.description.slice(0, 160),
  };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const series = await prisma.series
    .findUnique({
      where: { slug },
      include: {
        books: { orderBy: { seriesOrder: "asc" } },
      },
    })
    .catch(() => null);

  if (!series) notFound();

  const name = localizedTitle({ title: series.name, titleAr: series.nameAr, titleFr: series.nameFr }, locale);
  const cover = series.cover || series.books[0]?.cover || "";
  const total = series.books.reduce((s, b) => s + b.price, 0);

  return (
    <div className="container-store py-12">
      <div className="card-soft overflow-hidden">
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="relative h-72 bg-muted md:h-full">
            <img src={cover} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="p-6">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Layers className="h-4 w-4" />
              {t.series.label}
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold">{name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {localizedDescription(
                { description: series.description, descriptionAr: series.description, descriptionFr: series.description },
                locale
              )}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-end gap-2">
                <span className="font-display text-3xl font-extrabold text-primary">
                  {formatPrice(series.bundlePrice, locale)}
                </span>
                {series.oldPrice ? (
                  <span className="pb-1 text-sm text-muted-foreground line-through">
                    {formatPrice(series.oldPrice, locale)}
                  </span>
                ) : (
                  <span className="pb-1 text-sm text-muted-foreground line-through">
                    {formatPrice(total, locale)}
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent-foreground">
                <Tag className="h-3.5 w-3.5" />
                {t.bundles.save} {formatPrice(Math.max(0, total - series.bundlePrice), locale)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <h2 className="section-title">{t.series.inThisSeries}</h2>
        <p className="text-sm text-muted-foreground">
          {series.books.length} {t.shop.results}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {series.books.map((b) => (
          <BookCard
            key={b.id}
            book={
              {
                id: b.id,
                slug: b.slug,
                title: b.title,
                titleAr: b.titleAr,
                titleFr: b.titleFr,
                author: b.author,
                authorAr: b.authorAr,
                price: b.price,
                oldPrice: b.oldPrice,
                discountPercent: b.discountPercent,
                cover: b.cover,
                rating: b.rating,
                reviewsCount: b.reviewsCount,
                bestSeller: b.bestSeller,
                isNew: b.isNew,
                inStock: b.inStock,
                formats: b.formats,
              } as BookCardData
            }
          />
        ))}
      </div>

      <SeriesBuyButton
        seriesId={series.id}
        seriesTitle={name}
        bundlePrice={series.bundlePrice}
        cover={cover}
        books={series.books.map((b) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          titleAr: b.titleAr,
          titleFr: b.titleFr,
          cover: b.cover,
          price: b.price,
          discountPercent: b.discountPercent,
        }))}
      />
    </div>
  );
}
