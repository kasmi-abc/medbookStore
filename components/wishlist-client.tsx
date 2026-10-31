"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, ClipboardPaste, Heart, Share2, Trash2 } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { BookCard, type BookCardData } from "@/components/book-card";
import { useWishlist, decodeWishlist } from "@/lib/wishlist";

export function WishlistClient() {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const ids = useWishlist((s) => s.ids);
  const importIds = useWishlist((s) => s.importIds);
  const remove = useWishlist((s) => s.remove);
  const clear = useWishlist((s) => s.clear);
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [copied, setCopied] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importValue, setImportValue] = useState("");

  const load = useCallback(async () => {
    if (ids.length === 0) {
      setBooks([]);
      return;
    }
    const res = await fetch(`/api/books?ids=${ids.join(",")}`);
    const data = await res.json();
    setBooks(data.books ?? []);
  }, [ids]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const share = searchParams.get("share");
    if (share) {
      const decoded = decodeWishlist(share);
      if (decoded.length) {
        importIds(decoded);
        toast(t.wishlist.imported);
      }
    }
  }, [searchParams, importIds, toast, t]);

  const shareLink = () => {
    if (ids.length === 0) return;
    const url = `${window.location.origin}/${lang}/wishlist?share=${btoa(encodeURIComponent(ids.join(",")))}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast(t.wishlist.copied);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const doImport = () => {
    const match = importValue.match(/share=([A-Za-z0-9+/=]+)/);
    const code = match ? match[1] : importValue.trim();
    const decoded = decodeWishlist(code);
    if (decoded.length === 0) {
      toast(t.common.error);
      return;
    }
    importIds(decoded);
    setImportValue("");
    setImportOpen(false);
    toast(t.wishlist.imported);
  };

  return (
    <div className="container-store py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Heart className="h-6 w-6 text-accent" />
            {t.wishlist.title}
          </h1>
          <p className="section-sub">
            {books.length} {t.shop.results}
          </p>
        </div>
        {ids.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={shareLink} className="btn-secondary">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
              {t.wishlist.share}
            </button>
            <button type="button" onClick={() => setImportOpen((o) => !o)} className="btn-secondary">
              <ClipboardPaste className="h-4 w-4" />
              {t.wishlist.import}
            </button>
            <button
              type="button"
              onClick={() => {
                clear();
                toast(t.wishlist.clearAll);
              }}
              className="btn-ghost text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
              {t.wishlist.clearAll}
            </button>
          </div>
        )}
      </div>

      {importOpen && (
        <div className="card-soft mb-8 p-5">
          <p className="text-sm font-medium">{t.wishlist.importTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t.wishlist.importText}</p>
          <div className="mt-3 flex gap-2">
            <input
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder="https://.../wishlist?share=..."
              className="input-base flex-1"
              dir="ltr"
            />
            <button type="button" onClick={doImport} className="btn-primary">
              {t.wishlist.import}
            </button>
          </div>
        </div>
      )}

      {ids.length === 0 ? (
        <div className="card-soft py-20 text-center">
          <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </span>
          <h2 className="mt-6 font-display text-xl font-bold">{t.wishlist.empty}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.wishlist.emptyText}</p>
          <Link href={`/${lang}/shop`} className="btn-primary mt-6">
            {t.cart.browse}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((b) => (
            <div key={b.id} className="relative">
              <BookCard book={b} />
              <button
                type="button"
                onClick={() => remove(b.id)}
                aria-label={t.cart.remove}
                className="absolute end-5 top-5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-red-500 shadow backdrop-blur hover:scale-110"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
