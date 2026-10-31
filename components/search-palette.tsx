"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search, Star } from "lucide-react";
import { useLang } from "@/components/providers";
import { cn } from "@/lib/utils";

type Result = {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  titleFr: string;
  author: string;
  price: number;
  cover: string;
  rating: number;
  category: string;
};

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQ("");
      setResults([]);
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&lang=${lang}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(0);
      } catch {
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, open, lang]);

  const titleOf = (r: Result) =>
    lang === "ar" ? r.titleAr || r.title : lang === "fr" ? r.titleFr || r.title : r.title;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      const el = listRef.current?.querySelectorAll("[data-item]")[active] as HTMLAnchorElement | undefined;
      el?.click();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <button aria-label={t.nav.close} className="absolute inset-0 bg-foreground/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl animate-fade-up overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl">
        <div className="flex items-center gap-3 border-b px-4">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t.search.placeholder}
            className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70"
          />
          <kbd className="hidden rounded-lg border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:block">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim().length < 2 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t.search.hint}</p>
          )}
          {q.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t.search.noResults}</p>
          )}
          {results.map((r, i) => (
            <Link
              key={r.id}
              data-item
              href={`/${lang}/book/${r.slug}`}
              onClick={onClose}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex items-center gap-3 rounded-2xl p-2.5 transition",
                i === active && "bg-primary/10"
              )}
            >
              <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img src={r.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{titleOf(r)}</span>
                <span className="block truncate text-xs text-muted-foreground">{r.author}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-bold text-primary">
                  {new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : "en-US").format(r.price)}{" "}
                  {t.common.currency}
                </span>
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {r.rating.toFixed(1)}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between border-t px-4 py-2.5 text-[11px] text-muted-foreground">
          <span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">⌘K</kbd> {t.nav.search}
          </span>
          <span>{t.search.title}</span>
        </div>
      </div>
    </div>
  );
}
