"use client";
import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { useLang } from "@/components/providers";

export function LookInside({
  sampleText,
  title,
}: {
  sampleText: string | null;
  title: string;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!sampleText}
        className="btn-secondary w-full py-3 disabled:opacity-50"
      >
        <BookOpen className="h-4 w-4" />
        {t.product.lookInside}
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <button aria-label={t.nav.close} className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative max-h-[85vh] w-full max-w-lg animate-fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="font-display font-bold">{t.product.lookInsideTitle}</h3>
                <p className="truncate text-xs text-muted-foreground">{title}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={t.nav.close} className="rounded-full p-2 hover:bg-foreground/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-6">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.product.lookInsideNote}
              </p>
              <div className="rounded-2xl border border-border bg-background p-6 font-serif text-[15px] leading-8 text-foreground/90 shadow-inner">
                {sampleText}
                <div className="mt-8 border-t border-dashed pt-4 text-center text-xs italic text-muted-foreground">
                  …
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
