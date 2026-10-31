import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "mdz_admin_session";
const MAX_AGE = 60 * 60 * 12;

function secret(): string {
  return process.env.SESSION_SECRET || "dev-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyCredentials(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME || "admin";
  const p = process.env.ADMIN_PASSWORD || "";
  return safeEqual(username, u) && safeEqual(password, p);
}

export async function createAdminSession(): Promise<void> {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `admin.${exp}`;
  const token = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [name, exp, sig] = parts;
    if (name !== "admin") return false;
    if (!safeEqual(sig, sign(`${name}.${exp}`))) return false;
    if (Number(exp) < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}
