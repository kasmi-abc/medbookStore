"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Facebook,
  Flame,
  Gift,
  Heart,
  Instagram,
  Menu,
  Package,
  Search,
  Sparkles,
  Tags,
  User,
  X,
} from "lucide-react";
import { useLang } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SearchPalette } from "@/components/search-palette";
import { useCart } from "@/lib/store";
import { useWishlist } from "@/lib/wishlist";
import { iconMap } from "@/lib/lucide-map";
import { cn } from "@/lib/utils";

export type NavCategory = {
  slug: string;
  name: string;
  nameAr: string;
  nameFr: string;
  icon: string;
};

function useLocalHref() {
  const pathname = usePathname();
  const { lang } = useLang();
  const go = (path: string) => `/${lang}${path === "/" ? "" : path}`;
  return { pathname, lang, go };
}

export function NavbarClient({ categories }: { categories: NavCategory[] }) {
  const { t, lang } = useLang();
  const { pathname, go } = useLocalHref();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const [mounted, setMounted] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setDrawer(false);
    setCatsOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setDrawer(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const catLabel = (c: NavCategory) =>
    lang === "ar" ? c.nameAr : lang === "fr" ? c.nameFr : c.name;

  const isActive = (path: string) => {
    const href = go(path);
    return pathname === href || (path !== "/" && pathname.startsWith(href));
  };

  const links = [
    { href: "/", label: t.nav.home, icon: BookOpen },
    { href: "/shop?tag=best", label: t.nav.bestSellers, icon: Flame },
    { href: "/shop?tag=new", label: t.nav.newReleases, icon: Sparkles },
    { href: "/shop?sale=1", label: t.nav.offers, icon: Tags },
    { href: "/bundles", label: t.nav.bundles, icon: Gift },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
        <div className="container-store flex h-[76px] items-center justify-between gap-3">
          <Link href={go("/")} className="group flex min-w-0 items-center gap-2.5">
            <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-card ring-1 ring-border/70 sm:h-11 sm:w-11">
              <img src="/logo.jpg" alt={t.brand.name} className="h-full w-full object-cover" />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-display text-[15px] font-bold tracking-tight sm:text-[17px]">
                Medical <span className="text-brand-600 dark:text-brand-300">Books</span> DZ
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {t.brand.badge}
              </span>
            </span>
          </Link>

          <nav className="pill-nav hidden lg:flex" aria-label="main">
            <Link
              href={go("/")}
              className={cn("pill-link", isActive("/") && !pathname.startsWith("/shop") && "pill-link-active")}
            >
              {t.nav.home}
            </Link>

            <div className="relative" onMouseLeave={() => setCatsOpen(false)}>
              <button
                type="button"
                onMouseEnter={() => setCatsOpen(true)}
                onClick={() => setCatsOpen((o) => !o)}
                aria-expanded={catsOpen}
                className={cn(
                  "pill-link",
                  pathname.startsWith(go("/shop")) && !pathname.includes("tag=") && "pill-link-active"
                )}
              >
                {t.nav.explore}
                <ChevronDown className={cn("h-3.5 w-3.5 transition", catsOpen && "rotate-180")} />
              </button>
              {catsOpen && (
                <div className="absolute start-0 top-full z-50 mt-2 w-[520px] rounded-3xl border border-border/70 bg-card p-4 shadow-2xl">
                  <div className="grid grid-cols-2 gap-1.5">
                    {categories.map((c) => {
                      const Icon = iconMap[c.icon] ?? BookOpen;
                      return (
                        <Link
                          key={c.slug}
                          href={go(`/shop?category=${encodeURIComponent(c.slug)}`)}
                          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition hover:bg-foreground/5"
                        >
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          {catLabel(c)}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="divider my-3" />
                  <Link
                    href={go("/shop")}
                    className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
                  >
                    {t.nav.allCategories}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              )}
            </div>

            {links.slice(1).map((l) => (
              <Link
                key={l.href}
                href={go(l.href)}
                className={cn("pill-link", isActive(l.href.split("?")[0]) && l.href.includes("tag=") && "pill-link-active")}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t.nav.search}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <Link
              href={go("/wishlist")}
              aria-label={t.nav.wishlist}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
            >
              <Heart className="h-[18px] w-[18px]" />
              {mounted && wishCount > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {wishCount}
                </span>
              )}
            </Link>

            <Link
              href={go("/cart")}
              aria-label={t.nav.cart}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[19px] w-[19px]">
                <path d="M6 7h12l-1.2 12.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
              {mounted && count > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>

            <div className="hidden items-center gap-0.5 sm:flex sm:gap-1">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <Link
              href={go("/account")}
              aria-label={t.nav.account}
              className="hidden h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground sm:inline-flex"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>

            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label={t.nav.menu}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-foreground/5 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label={t.nav.close}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 end-0 flex w-[86%] max-w-sm flex-col bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <span className="font-display text-lg font-bold">{t.brand.short}</span>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label={t.nav.close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-foreground/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={go(l.href)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition hover:bg-foreground/5"
                  >
                    <Icon className="h-[18px] w-[18px] text-primary" />
                    {l.label}
                  </Link>
                );
              })}
              <div className="divider my-2" />
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.nav.categories}
              </p>
              {categories.map((c) => {
                const Icon = iconMap[c.icon] ?? BookOpen;
                return (
                  <Link
                    key={c.slug}
                    href={go(`/shop?category=${encodeURIComponent(c.slug)}`)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition hover:bg-foreground/5"
                  >
                    <Icon className="h-[18px] w-[18px] text-primary" />
                    {catLabel(c)}
                  </Link>
                );
              })}
              <div className="divider my-2" />
              <Link href={go("/track")} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium hover:bg-foreground/5">
                <Package className="h-[18px] w-[18px] text-primary" />
                {t.nav.track}
              </Link>
              <Link href={go("/account")} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium hover:bg-foreground/5">
                <User className="h-[18px] w-[18px] text-primary" />
                {t.nav.account}
              </Link>
              <Link href={go("/about")} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium hover:bg-foreground/5">
                <BookOpen className="h-[18px] w-[18px] text-primary" />
                {t.nav.about}
              </Link>
              <Link href={go("/contact")} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium hover:bg-foreground/5">
                <Gift className="h-[18px] w-[18px] text-primary" />
                {t.nav.contact}
              </Link>
            </nav>
            <div className="space-y-3 border-t p-4">
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/medical.books.dz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition hover:border-primary hover:text-primary"
                >
                  <Instagram className="h-[18px] w-[18px]" />
                </a>
                <a
                  href="https://www.facebook.com/107350227737347?ref=PRODASH_UPSELL_xav_ig_profile_page_web"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition hover:border-primary hover:text-primary"
                >
                  <Facebook className="h-[18px] w-[18px]" />
                </a>
                <span className="ms-auto inline-flex h-10 items-center rounded-full border border-border">
                  <ThemeToggle />
                </span>
              </div>
              <LanguageSwitcher compact />
            </div>
          </div>
        </div>
      )}

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
