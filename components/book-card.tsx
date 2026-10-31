"use client";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { Stars } from "@/components/stars";
import { useCart, cartId } from "@/lib/store";
import { useWishlist } from "@/lib/wishlist";
import { formatPrice, localizedAuthor, localizedTitle, priceForFormat, parseFormats } from "@/lib/book";
import { cn } from "@/lib/utils";

export type BookCardData = {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  titleFr: string;
  author: string;
  authorAr: string | null;
  price: number;
  oldPrice: number | null;
  discountPercent: number | null;
  cover: string;
  rating: number;
  reviewsCount: number;
  bestSeller: boolean;
  isNew: boolean;
  inStock: boolean;
  formats: unknown;
};

export function BookCard({ book, priority = false }: { book: BookCardData; priority?: boolean }) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(book.id));

  const formats = parseFormats(book.formats);
  const first = formats.find((f) => f.stock) ?? formats[0];
  const price = priceForFormat(book.price, first, book.discountPercent);

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    add({
      id: cartId(book.id, first.key),
      bookId: book.id,
      slug: book.slug,
      title: book.title,
      titleAr: book.titleAr,
      price,
      image: book.cover,
      format: first.key,
    });
    toast(t.product.added);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWish(book.id);
    toast(wished ? t.wishlist.removed : t.wishlist.added);
  };

  return (
    <Link
      href={`/${lang}/book/${book.slug}`}
      className="group relative flex flex-col rounded-3xl border border-border/60 bg-card p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="book-cover aspect-[3/4] w-full">
        <img
          src={book.cover}
          alt={localizedTitle(book, lang)}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-2 top-2 flex flex-wrap items-start justify-between gap-1">
          <span className="flex flex-col gap-1">
            {book.discountPercent ? (
              <span className="badge bg-accent text-accent-foreground shadow">-{book.discountPercent}%</span>
            ) : null}
            {book.isNew && !book.discountPercent ? (
              <span className="badge bg-primary text-primary-foreground shadow">{t.common.new}</span>
            ) : null}
            {book.bestSeller && !book.isNew && !book.discountPercent ? (
              <span className="badge bg-foreground text-background shadow">{t.common.best}</span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={t.nav.wishlist}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow backdrop-blur transition hover:scale-110",
              wished ? "text-accent" : "text-foreground/60"
            )}
          >
            <Heart className={cn("h-4 w-4", wished && "fill-current")} />
          </button>
        </div>
        <button
          type="button"
          onClick={addToCart}
          disabled={!book.inStock}
          className={cn(
            "absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-full bg-foreground/90 py-2 text-xs font-semibold text-background shadow-lg backdrop-blur transition duration-300",
            "translate-y-0 opacity-100",
            "lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100",
            "focus-visible:translate-y-0 focus-visible:opacity-100",
            !book.inStock && "hidden"
          )}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {book.inStock ? t.product.addToCart : t.product.outOfStock}
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-primary">
          {localizedTitle(book, lang)}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {localizedAuthor(book, lang)}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <Stars value={book.rating} />
          <span className="text-[11px] text-muted-foreground">({book.reviewsCount})</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex flex-col">
            {book.oldPrice && book.oldPrice > price ? (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatPrice(book.oldPrice, lang)}
              </span>
            ) : null}
            <span className="text-[15px] font-bold text-primary">{formatPrice(price, lang)}</span>
          </div>
          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {book.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
