"use server";
import { prisma } from "@/lib/db";

export type NewsletterResult = { ok: boolean; message: string };

export async function subscribeNewsletter(email: string): Promise<NewsletterResult> {
  const clean = (email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(clean)) {
    return { ok: false, message: "invalid" };
  }
  try {
    await prisma.newsletter.upsert({
      where: { email: clean },
      update: {},
      create: { email: clean },
    });
    return { ok: true, message: "ok" };
  } catch {
    return { ok: false, message: "error" };
  }
}
