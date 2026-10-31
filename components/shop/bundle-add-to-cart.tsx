"use client";
import { Layers } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { useCart, cartId } from "@/lib/store";
import { localizedTitle } from "@/lib/book";

export type BundleBookLite = {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  titleFr: string;
  cover: string;
  price: number;
  discountPercent: number | null;
};

export function BundleAddToCart({
  bundleId,
  title,
  titleAr,
  price,
  cover,
  books,
}: {
  bundleId: string;
  title: string;
  titleAr: string;
  price: number;
  cover: string;
  books: BundleBookLite[];
}) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const add = useCart((s) => s.add);

  const addBundle = () => {
    add({
      id: cartId(`bundle-${bundleId}`, "bundle"),
      bookId: `bundle-${bundleId}`,
      slug: `bundle-${bundleId}`,
      title,
      titleAr,
      price,
      image: cover,
      format: "bundle",
    });
    toast(
      `${t.product.added} — ${localizedTitle({ title, titleAr, titleFr: title }, lang)} (${books.length})`
    );
  };

  return (
    <button type="button" onClick={addBundle} className="btn-primary w-full py-3">
      <Layers className="h-4 w-4" />
      {t.product.addToCart} · {books.length}
    </button>
  );
}
