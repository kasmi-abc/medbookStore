"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { useLang } from "@/components/providers";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, switchLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.nav.language}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground",
          compact ? "h-11 px-4 text-sm font-medium" : "h-9 px-2.5"
        )}
      >
        <Globe className="h-[18px] w-[18px]" />
        {!compact && <span className="text-xs font-semibold uppercase">{lang}</span>}
      </button>
      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-2xl border bg-card p-1.5 shadow-xl">
          {locales.map((l: Locale) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setOpen(false);
                switchLang(l);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-foreground/5",
                l === lang && "font-semibold text-primary"
              )}
            >
              <span>{localeNames[l]}</span>
              {l === lang && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
