import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Tag } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/book";
import { BundleAddToCart } from "@/components/shop/bundle-add-to-cart";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=60";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.nav.bundles} · Medical Books DZ` };
}

export default async function BundlesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const bundles = await prisma.bundle.findMany({
    where: { active: true },
    include: {
      items: {
        include: {
          book: {
            select: { id: true, slug: true, title: true, titleAr: true, titleFr: true, cover: true, price: true, discountPercent: true },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  }).catch(() => []);

  const localeTitle = (b: { title: string; titleAr: string; titleFr: string }) =>
    locale === "ar" ? b.titleAr : locale === "fr" ? b.titleFr : b.title;

  return (
    <div className="container-store py-12">
      <div className="mb-10 text-center">
        <h1 className="section-title flex items-center justify-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          {t.nav.bundles}
        </h1>
        <p className="section-sub">{t.bundles.subtitle}</p>
      </div>

      {bundles.length === 0 ? (
        <p className="card-soft py-16 text-center text-muted-foreground">{t.bundles.empty}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((b) => {
            const base = b.items.reduce((s, i) => s + i.book.price, 0);
            const saving = Math.max(0, base - b.price);
            const cover = b.cover || b.items[0]?.book.cover || FALLBACK_COVER;
            return (
              <article key={b.id} className="card-soft flex flex-col overflow-hidden">
                <div className="relative h-44 overflow-hidden bg-muted">
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                  <span className="absolute start-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                    {t.bundles.save} {formatPrice(saving, locale)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-lg font-bold">{localeTitle(b)}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {b.items.map((i) => (
                      <li key={i.id} className="flex items-center gap-1.5">
                        <Tag className="h-3 w-3 shrink-0 text-primary" />
                        <Link href={`/${locale}/book/${i.book.slug}`} className="truncate hover:text-primary hover:underline">
                          {locale === "ar" ? i.book.titleAr || i.book.title : locale === "fr" ? i.book.titleFr || i.book.title : i.book.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-4">
                    <div className="flex items-end gap-2">
                      <span className="font-display text-2xl font-extrabold text-primary">{formatPrice(b.price, locale)}</span>
                      <span className="pb-1 text-sm text-muted-foreground line-through">{formatPrice(base, locale)}</span>
                    </div>
                    <div className="mt-3">
                      <BundleAddToCart
                        bundleId={b.id}
                        title={b.title}
                        titleAr={b.titleAr}
                        price={b.price}
                        cover={cover}
                        books={b.items.map((i) => ({
                          id: i.book.id,
                          slug: i.book.slug,
                          title: i.book.title,
                          titleAr: i.book.titleAr,
                          titleFr: i.book.titleFr,
                          cover: i.book.cover,
                          price: i.book.price,
                          discountPercent: i.book.discountPercent,
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
