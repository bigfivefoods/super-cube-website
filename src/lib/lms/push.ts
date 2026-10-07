/**
 * Web Push opt-in (browser side). Stays off unless NEXT_PUBLIC_LMS_PUSH=1 and
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY are set through the Vercel env flow.
 */
export const PUSH_ENABLED =
  process.env.NEXT_PUBLIC_LMS_PUSH === "1" && Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export type PushOutcome = "on" | "denied" | "unsupported" | "not_configured" | "consent_required" | "signed_out" | "error";

export async function turnOnPush(): Promise<PushOutcome> {
  if (!PUSH_ENABLED) return "not_configured";
  if (!pushSupported()) return "unsupported";
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return "denied";
  try {
    const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js"));
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string),
      }));
    const res = await fetch("/api/lms/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    });
    if (res.status === 401) return "signed_out";
    if (res.status === 403) return "consent_required";
    if (res.status === 501) return "not_configured";
    return res.ok ? "on" : "error";
  } catch {
    return "error";
  }
}

export async function turnOffPush(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    await fetch("/api/lms/push", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub?.endpoint }),
    });
    await sub?.unsubscribe();
    return true;
  } catch {
    return false;
  }
}
