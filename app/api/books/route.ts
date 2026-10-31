import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);

  if (ids.length === 0) return NextResponse.json({ books: [] });

  try {
    const books = await prisma.book.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        slug: true,
        title: true,
        titleAr: true,
        titleFr: true,
        author: true,
        authorAr: true,
        price: true,
        oldPrice: true,
        discountPercent: true,
        cover: true,
        rating: true,
        reviewsCount: true,
        bestSeller: true,
        isNew: true,
        inStock: true,
        formats: true,
      },
    });
    return NextResponse.json({ books });
  } catch {
    return NextResponse.json({ books: [] });
  }
}
