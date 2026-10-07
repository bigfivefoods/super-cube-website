/**
 * Newsletter transactional email: the double opt-in confirmation, on the shared
 * Super-Cube® email layout (src/lib/email/layout.ts).
 */
import { button, link, paragraph, renderEmail, small, type RenderedEmail } from "@/lib/email/layout";
import { CONFIRM_TTL_DAYS } from "@/lib/newsletter/confirm";

export function confirmationEmail(opts: { confirmUrl: string; site?: string; assetBase?: string }): RenderedEmail {
  return renderEmail({
    subject: "Confirm your Super-Cube® newsletter subscription",
    preheader: "One click to confirm, and you'll get new Super-Cube® posts by email.",
    theme: "brand",
    label: "Newsletter",
    eyebrow: "Super-Cube® News",
    title: "Please confirm your subscription",
    intro:
      "Someone, hopefully you, asked to receive Super-Cube® News at this address. Press the button to confirm. Until you do, we won't send you any newsletters.",
    blocks: [
      button({ href: opts.confirmUrl, label: "Yes, subscribe me" }),
      small("Or copy this link into your browser: ", link(opts.confirmUrl, opts.confirmUrl)),
      paragraph(
        `Didn't ask for this? Ignore this email and you won't be subscribed. The link works for ${CONFIRM_TTL_DAYS} days.`,
      ),
    ],
    site: opts.site,
    assetBase: opts.assetBase,
    footer: {
      reason:
        "You're receiving this one-off email because this address was entered in the Super-Cube® newsletter signup form.",
    },
  });
}
