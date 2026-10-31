"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export type ReviewResult = { ok: boolean; error?: string };

const RATE_LIMIT_MS = 60_000;
const lastSubmit = new Map<string, number>();

export async function submitReview(input: {
  bookId: string;
  name: string;
  city?: string;
  stars: number;
  comment: string;
  ip?: string;
}): Promise<ReviewResult> {
  const name = (input.name || "").trim();
  const comment = (input.comment || "").trim();
  const stars = Math.min(5, Math.max(1, Math.round(input.stars || 5)));

  if (name.length < 2 || comment.length < 10) return { ok: false, error: "invalid" };

  const key = `${input.ip ?? "anon"}:${input.bookId}`;
  const now = Date.now();
  const last = lastSubmit.get(key);
  if (last && now - last < RATE_LIMIT_MS) return { ok: false, error: "rate" };
  lastSubmit.set(key, now);

  try {
    await prisma.review.create({
      data: { bookId: input.bookId, name, city: (input.city || "").trim() || null, stars, comment },
    });
    const count = await prisma.review.count({ where: { bookId: input.bookId } });
    const agg = await prisma.review.aggregate({ where: { bookId: input.bookId }, _avg: { stars: true } });
    await prisma.book.update({
      where: { id: input.bookId },
      data: { reviewsCount: count, rating: Number((agg._avg.stars ?? stars).toFixed(1)) },
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "server" };
  }
}

export async function markReviewHelpful(reviewId: string): Promise<ReviewResult> {
  try {
    await prisma.review.update({ where: { id: reviewId }, data: { helpful: { increment: 1 } } });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
