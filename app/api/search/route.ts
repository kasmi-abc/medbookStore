import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const lang = url.searchParams.get("lang") || "en";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { titleAr: { contains: q } },
          { titleFr: { contains: q, mode: "insensitive" } },
          { author: { contains: q, mode: "insensitive" } },
          { authorAr: { contains: q } },
          { isbn: { contains: q } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        titleAr: true,
        titleFr: true,
        author: true,
        price: true,
        cover: true,
        rating: true,
        categorySlug: true,
      },
      orderBy: { salesCount: "desc" },
      take: 8,
    });
    return NextResponse.json({ results: books, lang: isLocale(lang) ? lang : "en" });
  } catch {
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
