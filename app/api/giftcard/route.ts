import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ ok: false });
  try {
    const card = await prisma.giftCard.findUnique({ where: { code } });
    if (!card || card.isUsed) return NextResponse.json({ ok: false });
    if (card.expiresAt && card.expiresAt < new Date()) return NextResponse.json({ ok: false });
    return NextResponse.json({ ok: true, code: card.code, amount: card.amount });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
