"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLang } from "@/components/providers";

export function ThemeToggle() {
  const { t } = useLang();
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("mdz-theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t.nav.lightMode : t.nav.darkMode}
      title={dark ? t.nav.lightMode : t.nav.darkMode}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
    >
      {mounted && dark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
    </button>
  );
}
