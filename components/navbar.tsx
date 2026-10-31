import { prisma } from "@/lib/db";
import { NavbarClient, type NavCategory } from "./navbar-client";

export async function Navbar() {
  let categories: NavCategory[] = [];
  try {
    const rows = await prisma.category.findMany({ where: { parentSlug: null }, orderBy: { name: "asc" } });
    categories = rows.map((c) => ({
      slug: c.slug,
      name: c.name,
      nameAr: c.nameAr,
      nameFr: c.nameFr,
      icon: c.icon,
    }));
  } catch {
    categories = [];
  }
  return <NavbarClient categories={categories} />;
}
