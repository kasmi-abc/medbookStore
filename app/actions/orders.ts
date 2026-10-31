"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { shippingFee, wilayaByCode } from "@/lib/shipping";
import { generateOrderCode } from "@/lib/utils";

export type CartItemInput = {
  bookId: string;
  title: string;
  titleAr?: string;
  price: number;
  quantity: number;
  format: string;
  image?: string;
};

export type CheckoutInput = {
  customerName: string;
  phone: string;
  email?: string;
  wilaya: string;
  commune: string;
  address?: string;
  shippingType: "STOP_DESK" | "A_DOMICILE";
  paymentMethod: "COD" | "CARD";
  promoCode?: string;
  giftCardCode?: string;
  giftMessage?: string;
  items: CartItemInput[];
  note?: string;
};

export type CheckoutResult =
  | { ok: true; code: string; total: number }
  | { ok: false; error: "empty" | "invalid" | "wilaya" | "server" | "promo" | "gift" };

function validPhone(p: string) {
  return /^0[5-7]\d{8}$/.test(p.replace(/\s/g, ""));
}

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const name = (input.customerName || "").trim();
  const phone = (input.phone || "").trim().replace(/\s/g, "");
  const commune = (input.commune || "").trim();

  if (name.length < 3 || !validPhone(phone) || commune.length < 2) return { ok: false, error: "invalid" };
  if (!wilayaByCode(input.wilaya)) return { ok: false, error: "wilaya" };

  const items = (input.items || []).filter((i) => i.quantity > 0 && i.price >= 0);
  if (items.length === 0) return { ok: false, error: "empty" };

  const subtotal = items.reduce((sum, i) => sum + Math.round(i.price) * i.quantity, 0);
  const fee = shippingFee(input.wilaya, input.shippingType);

  let discount = 0;
  let promoCode: string | null = null;
  const promo = (input.promoCode || "").trim().toUpperCase();
  if (promo) {
    const found = await prisma.promoCode
      .findUnique({ where: { code: promo } })
      .catch(() => null);
    if (!found || !found.active || (found.expiresAt && found.expiresAt < new Date())) {
      return { ok: false, error: "promo" };
    }
    discount = Math.round((subtotal * found.percent) / 100);
    promoCode = found.code;
  }

  let giftCardId: string | null = null;
  const giftCode = (input.giftCardCode || "").trim().toUpperCase();
  if (giftCode) {
    const card = await prisma.giftCard
      .findUnique({ where: { code: giftCode } })
      .catch(() => null);
    if (!card || card.isUsed || (card.expiresAt && card.expiresAt < new Date())) {
      return { ok: false, error: "gift" };
    }
    const remaining = Math.max(0, subtotal - discount);
    discount += Math.min(card.amount, remaining);
    giftCardId = card.id;
  }

  const total = Math.max(0, subtotal - discount) + fee;
  const itemsCount = items.reduce((n, i) => n + i.quantity, 0);

  let code = generateOrderCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await prisma.order.findUnique({ where: { code } }).catch(() => null);
    if (!exists) break;
    code = generateOrderCode();
  }

  try {
    const order = await prisma.order.create({
      data: {
        code,
        customerName: name,
        phone,
        email: (input.email || "").trim() || null,
        wilaya: input.wilaya,
        commune,
        address: (input.address || "").trim() || null,
        shippingType: input.shippingType,
        paymentMethod: input.paymentMethod,
        subtotal,
        shippingFee: fee,
        discount,
        promoCode,
        giftCardId,
        giftMessage: (input.giftMessage || "").trim() || null,
        total,
        itemsCount,
        note: (input.note || "").trim() || null,
        items: {
          create: items.map((i) => ({
            bookId:
              i.bookId.startsWith("series-") || i.bookId.startsWith("bundle-") ? null : i.bookId,
            title: i.title,
            titleAr: i.titleAr || null,
            format: i.format,
            price: Math.round(i.price),
            quantity: i.quantity,
            image: i.image || null,
          })),
        },
      },
    });

    if (giftCardId) {
      await prisma.giftCard
        .update({
          where: { id: giftCardId },
          data: { isUsed: true, usedAt: new Date(), usedByOrder: order.code },
        })
        .catch(() => null);
    }

    try {
      revalidatePath("/", "layout");
    } catch {}
    return { ok: true, code: order.code, total: order.total };
  } catch {
    return { ok: false, error: "server" };
  }
}

export async function findOrders(identifier: string, phone?: string) {
  const id = (identifier || "").trim().toUpperCase();
  try {
    if (id) {
      const byCode = await prisma.order.findUnique({
        where: { code: id },
        include: { items: true },
      });
      if (byCode) {
        if (phone && byCode.phone.replace(/\s/g, "") !== phone.replace(/\s/g, "")) return [];
        return [serialize(byCode)];
      }
    }
    const cleanPhone = (phone || "").replace(/\s/g, "");
    if (!cleanPhone) return [];
    const byPhone = await prisma.order.findMany({
      where: { phone: cleanPhone },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return byPhone.map(serialize);
  } catch {
    return [];
  }
}

function serialize(o: {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string | null;
  shippingType: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  promoCode: string | null;
  giftMessage: string | null;
  note: string | null;
  total: number;
  status: string;
  createdAt: Date;
  items: { id: string; title: string; titleAr: string | null; format: string; price: number; quantity: number; image: string | null }[];
}) {
  return {
    id: o.id,
    code: o.code,
    customerName: o.customerName,
    phone: o.phone,
    wilaya: o.wilaya,
    commune: o.commune,
    address: o.address,
    shippingType: o.shippingType as "STOP_DESK" | "A_DOMICILE",
    paymentMethod: o.paymentMethod,
    subtotal: o.subtotal,
    shippingFee: o.shippingFee,
    discount: o.discount,
    promoCode: o.promoCode,
    giftMessage: o.giftMessage,
    note: o.note,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      title: i.title,
      titleAr: i.titleAr,
      format: i.format,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
  };
}

export type OrderDTO = Awaited<ReturnType<typeof findOrders>>[number];
