/**
 * Sample emails with clearly fake data: used for design previews, the admin
 * "send test emails" action and unit tests. Never sent to learners.
 */
import { constructs } from "@/lib/content";
import { COURSE_PRICE_ZAR } from "@/lib/programmes";
import { getSeatPack, seatPackAmountCents } from "@/lib/seat-packs";
import { emailSiteUrl, newsletterEmail, type RenderedEmail } from "@/lib/email/layout";
import { receiptEmail, seatPackEmail, weeklyEmail, welcomeEmail } from "@/lib/email/templates";

export type SampleId =
  | "welcome-demo"
  | "welcome-purchase"
  | "receipt"
  | "seat-pack"
  | "seat-pack-unclaimed"
  | "weekly"
  | "newsletter";

export const SAMPLE_IDS: SampleId[] = [
  "welcome-demo",
  "welcome-purchase",
  "receipt",
  "seat-pack",
  "seat-pack-unclaimed",
  "weekly",
  "newsletter",
];

/** The four main templates sent as a test set. */
export const MAIN_SAMPLES: SampleId[] = ["welcome-purchase", "receipt", "weekly", "newsletter"];

const choices = constructs.find((c) => c.id === "choices")!;
const pack = getSeatPack("seats_20")!;

export function sampleEmail(
  id: SampleId,
  o: { site?: string; assetBase?: string; programmeId?: "kids" | "adolescents" | "adults"; to?: string } = {},
): RenderedEmail {
  const site = (o.site ?? emailSiteUrl()).replace(/\/$/, "");
  const common = { site, assetBase: o.assetBase };
  const pid = o.programmeId ?? "adults";
  const paidAt = "2026-10-07T11:05:00.000Z";
  switch (id) {
    case "welcome-demo":
      return welcomeEmail({ ...common, name: "Craig Muller", programmeId: pid, mode: "demo" });
    case "welcome-purchase":
      return welcomeEmail({ ...common, name: "Craig Muller", programmeId: pid, mode: "purchase" });
    case "receipt":
      return receiptEmail({
        ...common,
        programmeId: pid,
        amountMinor: COURSE_PRICE_ZAR * 100,
        currency: "ZAR",
        reference: "SC-SAMPLE-0001",
        paidAt,
        email: o.to ?? "learner@example.com",
        name: "Craig Muller",
      });
    case "seat-pack":
      return seatPackEmail({
        ...common,
        programmeId: pid,
        code: "SAMPLE7",
        seats: pack.seats,
        amountMinor: seatPackAmountCents(pack, "ZAR"),
        currency: "ZAR",
        reference: "SC-SAMPLE-0002",
        paidAt,
      });
    case "seat-pack-unclaimed":
      return seatPackEmail({
        ...common,
        programmeId: pid,
        code: null,
        seats: pack.seats,
        amountMinor: seatPackAmountCents(pack, "ZAR"),
        currency: "ZAR",
        reference: "SC-SAMPLE-0003",
        paidAt,
      });
    case "weekly":
      return weeklyEmail({
        ...common,
        name: "Craig Muller",
        weekLabel: "Week 3",
        summary: "You completed three sessions and kept your streak alive. Your weekly plan is ready.",
        focus: "Emotional, Physical",
        programmeId: pid,
      });
    case "newsletter":
      return newsletterEmail({
        ...common,
        subject: "[Sample] Super-Cube® newsletter · One practical leadership idea",
        preheader: "This month: the Choices face, and one small practice to try this week.",
        issueLabel: "Sample issue",
        title: "Choosing well when the path isn't clear.",
        intro: "One practical leadership idea a month. This sample shows how a Super-Cube® newsletter issue looks.",
        sections: [
          {
            face: "choices",
            title: choices.tagline,
            paragraphs: [choices.summary, choices.description],
            cta: { href: `${site}/constructs#choices`, label: "Explore the Choices face" },
          },
          {
            eyebrow: "The model",
            title: "Six faces, developed from the core outward",
            paragraphs: [
              `Choices, Principles, Mental, Emotional, Physical and Spiritual: the six faces of the Super-Cube® Leadership Model.`,
            ],
            cta: { href: `${site}/the-model`, label: "See the model" },
          },
        ],
        cta: { href: `${site}/learn/start`, label: "Start free on Super-Cube® Learn" },
        signoff: "Craig",
        unsubscribeUrl: `${site}/newsletter/unsubscribe?t=00000000-0000-0000-0000-000000000000`,
        viewInBrowserUrl: undefined,
      });
  }
}
