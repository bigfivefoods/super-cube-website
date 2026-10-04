"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
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
  const res = await verifyAdminPassword(email, password);
  if (!res.ok) return { error: res.error };
  const value = makeSessionValue(res.email);
  if (!value) return { error: "Sign-in is not configured on this deployment." };
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: sessionMaxAge,
  });
  redirect("/newsletter/admin");
}

export async function signOutAction() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/newsletter/admin");
}
