import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ ok: false });
  try {
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.active) return NextResponse.json({ ok: false });
    if (promo.expiresAt && promo.expiresAt < new Date()) return NextResponse.json({ ok: false });
    return NextResponse.json({ ok: true, percent: promo.percent, code: promo.code });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
