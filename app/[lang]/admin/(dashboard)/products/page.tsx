import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/db";
import { ProductsTable } from "@/components/admin/products-table";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : "en");
  return { title: `${t.admin.products} · Medical Books DZ`, robots: { index: false } };
}

export default async function AdminProducts({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale);

  const books = await prisma.book.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      titleAr: true,
      author: true,
      cover: true,
      price: true,
      discountPercent: true,
      inStock: true,
      quantity: true,
      categorySlug: true,
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true, nameAr: true, nameFr: true, parentSlug: true },
  });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold">{t.admin.products}</h2>
      <ProductsTable books={books} categories={categories} />
    </div>
  );
}
