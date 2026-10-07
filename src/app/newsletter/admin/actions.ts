"use server";

import { cookies, headers } from "next/headers";
import { clientIp, hit } from "@/lib/server/rate-limit";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { newsletterDb } from "@/lib/newsletter/db";
import {
  ADMIN_COOKIE,
  getNewsletterAdmin,
  makeSessionValue,
  sessionMaxAge,
  verifyAdminPassword,
} from "@/lib/newsletter/admin-auth";

export async function signInAction(
  _prev: { error?: string } | undefined,
  form: FormData
): Promise<{ error?: string }> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  // Slow down password guessing: 5 tries per address from one IP, 20 per IP.
  // Not per address alone, so nobody can lock the admin out from elsewhere.
  const ip = clientIp(await headers());
  const perPair = await hit("admin-signin", [`ip-email:${ip}:${email.trim().toLowerCase()}`]);
  const perIp = perPair.allowed ? await hit("admin-signin-ip", [`ip:${ip}`]) : perPair;
  if (!perPair.allowed || !perIp.allowed) return { error: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  const res = await verifyAdminPassword(email, password);
  if (!res.ok) return { error: res.error };
  const value = makeSessionValue(res.email);
  if (!value) return { error: "Sign-in is not configured on this deployment." };
  const next = String(form.get("next") ?? "") === "/admin" ? "/admin" : "/newsletter/admin";
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: sessionMaxAge,
  });
  redirect(next);
}

export async function signOutAction(form?: FormData) {
  const next = String(form?.get("next") ?? "") === "/admin" ? "/admin" : "/newsletter/admin";
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect(next);
}

/** Toggle an enquiry between handled and open (admin only). */
export async function toggleHandledAction(form: FormData) {
  const admin = await getNewsletterAdmin();
  if (!admin.ok) return;
  const id = String(form.get("id") ?? "");
  const handled = String(form.get("handled") ?? "") === "1";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const db = newsletterDb();
  if (!db) return;
  await db
    .from("enquiries")
    .update(handled ? { handled_at: null, handled_by: null } : { handled_at: new Date().toISOString(), handled_by: admin.email })
    .eq("id", id);
  revalidatePath("/newsletter/admin");
}
