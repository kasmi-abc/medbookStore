import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(iso: string | Date, locale: string = "en"): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const map: Record<string, string> = { en: "en-GB", ar: "ar-DZ", fr: "fr-FR" };
  return new Intl.DateTimeFormat(map[locale] ?? "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function generateOrderCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `MDZ-${s}`;
}
