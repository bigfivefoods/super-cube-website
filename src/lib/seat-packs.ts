/**
 * School / company seat packs — Phase 2.
 * Volume pricing on top of single-learner COURSE_PRICE_ZAR / USD.
 */

import { COURSE_PRICE_USD, COURSE_PRICE_ZAR } from "@/lib/programmes";

export type SeatPackId = "seats_10" | "seats_20" | "seats_50";

export type SeatPack = {
  id: SeatPackId;
  seats: number;
  /** Discount fraction 0–1 applied to list price */
  discount: number;
  label: string;
  blurb: string;
  popular?: boolean;
};

export const SEAT_PACKS: SeatPack[] = [
  {
    id: "seats_10",
    seats: 10,
    discount: 0.1,
    label: "10 seats",
    blurb: "Classroom or small team pilot",
  },
  {
    id: "seats_20",
    seats: 20,
    discount: 0.15,
    label: "20 seats",
    blurb: "Department or grade cohort",
    popular: true,
  },
  {
    id: "seats_50",
    seats: 50,
    discount: 0.2,
    label: "50 seats",
    blurb: "School / company licence pack",
  },
];

export function getSeatPack(id: string): SeatPack | undefined {
  return SEAT_PACKS.find((p) => p.id === id);
}

/** Whole currency units (ZAR or USD) before converting to cents */
export function seatPackListPrice(
  pack: SeatPack,
  currency: "ZAR" | "USD"
): number {
  const unit = currency === "USD" ? COURSE_PRICE_USD : COURSE_PRICE_ZAR;
  const raw = unit * pack.seats * (1 - pack.discount);
  return Math.round(raw);
}

export function seatPackAmountCents(
  pack: SeatPack,
  currency: "ZAR" | "USD"
): number {
  return seatPackListPrice(pack, currency) * 100;
}

export function formatSeatPackPrice(
  pack: SeatPack,
  currency: "ZAR" | "USD" = "ZAR"
): string {
  const p = seatPackListPrice(pack, currency);
  return currency === "USD" ? `$${p} USD` : `R${p}`;
}

export function isSeatPackId(id: string): id is SeatPackId {
  return SEAT_PACKS.some((p) => p.id === id);
}
