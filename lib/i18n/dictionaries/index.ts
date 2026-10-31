import { en, type Dict } from "./en";
import { ar } from "./ar";
import { fr } from "./fr";
import type { Locale } from "../config";

const dictionaries: Record<Locale, Dict> = { en, ar, fr };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.en;
}

export type { Dict };
