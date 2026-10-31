"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Dict } from "@/lib/i18n/dictionaries";
import { dirOf, isLocale, type Locale } from "@/lib/i18n/config";

type LangContextValue = {
  lang: Locale;
  dir: "rtl" | "ltr";
  t: Dict;
  switchLang: (next: Locale) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside Providers");
  return ctx;
}

export function Providers({
  lang,
  dict,
  children,
}: {
  lang: Locale;
  dict: Dict;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [current, setCurrent] = useState<Locale>(lang);

  useEffect(() => {
    setCurrent(lang);
  }, [lang]);

  const switchLang = useCallback(
    (next: Locale) => {
      if (!isLocale(next)) return;
      setCurrent(next);
      document.documentElement.lang = next;
      document.documentElement.dir = dirOf(next);
      document.cookie = `mdz_lang=${next};path=/;max-age=31536000;samesite=lax`;
      const parts = pathname.split("/");
      if (isLocale(parts[1])) parts[1] = next;
      else parts.splice(1, 0, next);
      const target = parts.join("/") || `/${next}`;
      const qs = typeof window !== "undefined" ? window.location.search.slice(1) : "";
      router.push(qs ? `${target}?${qs}` : target);
    },
    [pathname, router]
  );

  return (
    <LangContext.Provider value={{ lang: current, dir: dirOf(current), t: dict, switchLang }}>
      {children}
    </LangContext.Provider>
  );
}
