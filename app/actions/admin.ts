"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createAdminSession, destroyAdminSession, isAdminAuthenticated, verifyCredentials } from "@/lib/auth";

export async function adminLogin(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!verifyCredentials(username, password)) return { ok: false, error: "invalid" };
  await createAdminSession();
  return { ok: true };
}

export async function adminLogout() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!(await isAdminAuthenticated())) return { ok: false };
  try {
    await prisma.order.update({ where: { id: orderId }, data: { status: status as never } });
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function updateBook(
  bookId: string,
  data: {
    title?: string;
    titleAr?: string;
    author?: string;
    price?: number;
    discountPercent?: number | null;
    inStock?: boolean;
    quantity?: number;
    cover?: string;
    categorySlug?: string | null;
  }
) {
  if (!(await isAdminAuthenticated())) return { ok: false };
  try {
    const upd: {
      title?: string;
      titleAr?: string;
      author?: string;
      price?: number;
      discountPercent?: number | null;
      inStock?: boolean;
      quantity?: number;
      cover?: string;
      categorySlug?: string | null;
    } = {};
    if (data.title !== undefined && data.title.trim().length >= 2) upd.title = data.title.trim();
    if (data.titleAr !== undefined && data.titleAr.trim().length >= 2) upd.titleAr = data.titleAr.trim();
    if (data.author !== undefined && data.author.trim().length >= 2) upd.author = data.author.trim();
    if (data.price !== undefined) upd.price = Math.max(0, Math.round(data.price));
    if (data.discountPercent !== undefined) upd.discountPercent = data.discountPercent;
    if (data.inStock !== undefined) upd.inStock = data.inStock;
    if (data.quantity !== undefined) upd.quantity = Math.max(0, Math.round(data.quantity));
    if (data.cover !== undefined && data.cover.trim()) {
      const cover = data.cover.trim();
      if (/^https?:\/\//.test(cover)) upd.cover = cover;
    }
    if (data.categorySlug !== undefined) upd.categorySlug = data.categorySlug || null;
    await prisma.book.update({ where: { id: bookId }, data: upd });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

function slugifyBook(input: string) {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "book";
}

export async function createBook(input: {
  title: string;
  titleAr: string;
  author: string;
  price: number;
  quantity: number;
  cover: string;
  categorySlug: string;
}) {
  if (!(await isAdminAuthenticated())) return { ok: false as const };
  const title = input.title.trim();
  const author = input.author.trim();
  const cover = input.cover.trim();
  const price = Math.round(input.price);
  if (title.length < 2 || author.length < 2 || !(price >= 0)) return { ok: false as const };
  if (!/^https?:\/\//.test(cover)) return { ok: false as const };

  const base = slugifyBook(title);
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const exists = await prisma.book.findUnique({ where: { slug } }).catch(() => null);
    if (!exists) break;
    slug = `${base}-${i}`;
  }

  try {
    const quantity = Math.max(0, Math.round(input.quantity));
    await prisma.book.create({
      data: {
        title,
        titleAr: input.titleAr.trim() || title,
        titleFr: title,
        slug,
        description: "Medical textbook available now at Medical Books DZ.",
        descriptionAr: "كتاب طبي متوفر الآن في ميديكال بوكس دي زد.",
        descriptionFr: "Manuel médical disponible dès maintenant chez Medical Books DZ.",
        author,
        price,
        cover,
        quantity,
        inStock: quantity > 0,
        isNew: true,
        categorySlug: input.categorySlug || null,
      },
    });
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
}

export async function deleteBook(bookId: string) {
  if (!(await isAdminAuthenticated())) return { ok: false };
  try {
    await prisma.book.delete({ where: { id: bookId } });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function saveShippingCompany(input: {
  id?: string;
  name: string;
  nameAr: string;
  nameFr: string;
  code: string;
  trackingUrl: string;
  phone: string;
  active: boolean;
}) {
  if (!(await isAdminAuthenticated())) return { ok: false };
  const name = input.name.trim();
  const code = input.code.trim().toLowerCase();
  const nameAr = input.nameAr.trim() || name;
  const nameFr = input.nameFr.trim() || name;
  if (name.length < 2 || !/^[a-z0-9-]{2,}$/.test(code)) return { ok: false };
  try {
    const data = {
      name,
      nameAr,
      nameFr,
      code,
      trackingUrl: input.trackingUrl.trim() || null,
      phone: input.phone.trim() || null,
      active: input.active,
    };
    if (input.id) {
      await prisma.shippingCompany.update({ where: { id: input.id }, data });
    } else {
      const clash = await prisma.shippingCompany.findUnique({ where: { code } }).catch(() => null);
      if (clash) return { ok: false };
      await prisma.shippingCompany.create({ data });
    }
    revalidatePath("/admin/shipping");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deleteShippingCompany(id: string) {
  if (!(await isAdminAuthenticated())) return { ok: false };
  try {
    await prisma.shippingCompany.delete({ where: { id } });
    revalidatePath("/admin/shipping");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function createPromo(code: string, percent: number) {
  if (!(await isAdminAuthenticated())) return { ok: false };
  const clean = code.trim().toUpperCase();
  if (!clean || percent < 1 || percent > 90) return { ok: false };
  try {
    await prisma.promoCode.upsert({
      where: { code: clean },
      create: { code: clean, percent: Math.round(percent) },
      update: { percent: Math.round(percent), active: true },
    });
    revalidatePath("/admin/promos");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function togglePromo(code: string) {
  if (!(await isAdminAuthenticated())) return { ok: false };
  try {
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (!promo) return { ok: false };
    await prisma.promoCode.update({ where: { code }, data: { active: !promo.active } });
    revalidatePath("/admin/promos");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deletePromo(code: string) {
  if (!(await isAdminAuthenticated())) return { ok: false };
  try {
    await prisma.promoCode.delete({ where: { code } });
    revalidatePath("/admin/promos");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
