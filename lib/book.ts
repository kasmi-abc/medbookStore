export type FormatKey = "paperback" | "hardcover" | "ebook";

export type BookFormat = {
  key: FormatKey;
  delta: number;
  stock: boolean;
};

export const DEFAULT_FORMATS: BookFormat[] = [
  { key: "paperback", delta: 0, stock: true },
  { key: "hardcover", delta: 1500, stock: true },
  { key: "ebook", delta: -700, stock: true },
];

export function parseFormats(value: unknown): BookFormat[] {
  if (Array.isArray(value) && value.length > 0) {
    const out: BookFormat[] = [];
    for (const item of value as Record<string, unknown>[]) {
      if (item && typeof item === "object" && typeof item.key === "string") {
        out.push({
          key: item.key as FormatKey,
          delta: typeof item.delta === "number" ? item.delta : 0,
          stock: item.stock !== false,
        });
      }
    }
    if (out.length > 0) return out;
  }
  return DEFAULT_FORMATS;
}

export function priceForFormat(basePrice: number, format: BookFormat, bookDiscount?: number | null): number {
  let price = basePrice + format.delta;
  if (bookDiscount && bookDiscount > 0) price = Math.round(price * (1 - bookDiscount / 100));
  return Math.max(200, price);
}

export function localizedTitle(
  book: { title: string; titleAr: string; titleFr: string },
  lang: string
): string {
  if (lang === "ar") return book.titleAr || book.title;
  if (lang === "fr") return book.titleFr || book.title;
  return book.title;
}

export function localizedAuthor(
  book: { author: string; authorAr?: string | null },
  lang: string
): string {
  if (lang === "ar" && book.authorAr) return book.authorAr;
  return book.author;
}

export function localizedDescription(
  book: { description: string; descriptionAr: string; descriptionFr: string },
  lang: string
): string {
  if (lang === "ar") return book.descriptionAr || book.description;
  if (lang === "fr") return book.descriptionFr || book.description;
  return book.description;
}

export function formatPrice(price: number, lang: string): string {
  const locale = lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(price)} ${lang === "ar" ? "دج" : "DA"}`;
}
