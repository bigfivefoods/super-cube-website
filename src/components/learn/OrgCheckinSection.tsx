"use client";

import { useEffect, useState } from "react";
import { constructs } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";
import { useLmsT } from "@/lib/i18n/lms/use-lms-t";

type Face = { face: string; n: number; suppressed?: boolean; self_mean?: number; others_mean?: number; gap_mean?: number };
type Raw = { min_group: number; faces: Face[]; overall: Face & { face?: string }; learners_with_both: number };

const f1 = (v: number | undefined) => (v != null && Number.isFinite(Number(v)) ? (Math.round(Number(v) * 10) / 10).toFixed(1) : "–");
const sign = (v: number | undefined) => {
  if (v == null || !Number.isFinite(Number(v))) return "–";
  const n = Math.round(Number(v) * 10) / 10;
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}`;
};

/** Organisation view of self-report vs manager and peer check-ins. Aggregates only. */
export function OrgCheckinSection({ orgId }: { orgId: string }) {
  const { t, fill } = useLmsT();
  const [view, setView] = useState<{ orgId: string; raw: Raw | null; note: string | null } | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let cancel = false;
    void fetch(`/api/org/checkins?org=${encodeURIComponent(orgId)}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (cancel) return;
        if (r.ok && j.comparison) setView({ orgId, raw: j.comparison as Raw, note: null });
        else if (j.error === "not_ready") setView({ orgId, raw: null, note: "Check-ins are not switched on yet" });
        else setView({ orgId, raw: null, note: null });
      })
      .catch(() => {
        if (!cancel) setView({ orgId, raw: null, note: null });
      });
    return () => {
      cancel = true;
    };
  }, [orgId]);

  const raw = view?.orgId === orgId ? view.raw : null;
  const note = view?.orgId === orgId ? view.note : null;

  if (note) {
    return (
      <section className="learn-card" data-testid="org-checkins">
        <h2 className="learn-card-title">{t("Self and others, by Super-Cube® face")}</h2>
        <p className="learn-meta mt-1">{t(note)}</p>
      </section>
    );
  }
  if (!raw) return null;

  const k = raw.min_group || 3;
  const rows = [
    ...constructs.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      stat: raw.faces.find((f) => f.face === c.id),
    })),
    { id: "overall", name: t("Overall"), color: "#0a0a0a", stat: raw.overall },
  ];

  return (
    <section className="learn-card" aria-labelledby="checkins-h" data-testid="org-checkins">
      <h2 id="checkins-h" className="learn-card-title">{t("Self and others, by Super-Cube® face")}</h2>
      <p className="learn-meta mt-0.5">
        {fill(
          "Learners who share progress, with a self-report and a check-in. Peer ratings count only once 3 peers have answered. Groups under {k} stay hidden. No names or individual scores.",
          { k },
        )}
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-start text-[0.8125rem]">
          <caption className="sr-only">{t("Self and others, by Super-Cube® face")}</caption>
          <thead>
            <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.08em] text-muted">
              <th scope="col" className="py-2 pe-2 text-start">{t("Face")}</th>
              <th scope="col" className="px-1 py-2 text-end">{t("Self")}</th>
              <th scope="col" className="px-1 py-2 text-end">{t("Others")}</th>
              <th scope="col" className="px-1 py-2 text-end">{t("Gap")}</th>
              <th scope="col" className="py-2 ps-1 text-end">{t("Paired learners")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const suppressed = !row.stat || row.stat.suppressed || (row.stat.n ?? 0) < k || row.stat.self_mean == null;
              return (
                <tr key={row.id} className="border-b border-line last:border-0" data-face={row.id}>
                  <th scope="row" className={`py-2 pe-2 text-start font-semibold ${row.id === "overall" ? "text-ink" : "face-ink"}`} style={row.id === "overall" ? undefined : faceInkStyle(row.color)}>
                    {row.id === "overall" ? row.name : t(row.name)}
                  </th>
                  {suppressed ? (
                    <td colSpan={4} className="py-2 text-end text-slate">
                      {fill("Shown once {k}+ learners have both", { k })}
                    </td>
                  ) : (
                    <>
                      <td className="px-1 py-2 text-end tabular-nums">{f1(row.stat?.self_mean)}</td>
                      <td className="px-1 py-2 text-end tabular-nums">{f1(row.stat?.others_mean)}</td>
                      <td className="px-1 py-2 text-end font-semibold tabular-nums">{sign(row.stat?.gap_mean)}</td>
                      <td className="py-2 ps-1 text-end tabular-nums">{row.stat?.n}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
