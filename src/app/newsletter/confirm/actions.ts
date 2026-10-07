"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { confirmByToken } from "@/lib/newsletter/confirm";
import { forwardConfirmedSubscriber } from "@/lib/newsletter/forward";
import { clientIp, hit } from "@/lib/server/rate-limit";

export type ConfirmState = { result?: "confirmed" | "expired" | "invalid" | "unavailable" | "limited" };

/** The button on /newsletter/confirm: a POST, so mail scanners that open links can't confirm. */
export async function confirmAction(_prev: ConfirmState, form: FormData): Promise<ConfirmState> {
  const token = String(form.get("token") ?? "").slice(0, 64);
  const ip = clientIp(await headers());
  const rl = await hit("newsletter-confirm", [`ip:${ip}`]);
  if (!rl.allowed) return { result: "limited" };
  const salt = process.env.NEWSLETTER_IP_SALT?.trim();
  const ipHash = salt && ip !== "unknown" ? createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24) : null;
  const res = await confirmByToken(token, ipHash);
  if (res.result === "confirmed" && "email" in res && res.email) await forwardConfirmedSubscriber(res.email);
  return { result: res.result };
}
