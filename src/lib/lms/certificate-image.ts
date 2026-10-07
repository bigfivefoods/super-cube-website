/**
 * LinkedIn-friendly share image (1200×627 at 2×) drawn on a canvas in the
 * browser. Same facts as the PDF: name, programme, before/after, author,
 * verification ID and URL.
 */
import { constructs } from "@/lib/content";
import { RADAR_ORDER } from "@/components/learn/RadarChart";
import {
  CERT_AUTHOR,
  CERT_AUTHOR_ROLE,
  formatIssuedDate,
  programmeName,
  round1,
  signed,
  verifyDisplay,
  type CertificateData,
} from "@/lib/lms/certificate";
import type { ConstructScore } from "@/lib/lms/scoring";

export const SHARE_W = 1200;
export const SHARE_H = 627;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function ordered(scores: ConstructScore[]) {
  return RADAR_ORDER.map((id) => scores.find((s) => s.constructId === id));
}

function drawMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const order = ["choices", "spiritual", "physical", "principles", "emotional", "mental"];
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
  order.forEach((id, i) => {
    const a = pts[(i + 5) % 6];
    const b = pts[i];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.closePath();
    ctx.fillStyle = constructs.find((c) => c.id === id)?.color ?? "#333";
    ctx.fill();
  });
}

function drawRadar(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, before: ConstructScore[], after: ConstructScore[], sans: string) {
  const pre = ordered(before);
  const post = ordered(after);
  const n = 6;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const r = (Math.min(100, Math.max(0, v)) / 100) * radius;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const path = (vals: number[]) => {
    ctx.beginPath();
    vals.forEach((v, i) => {
      const [x, y] = pt(i, v);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.closePath();
  };
  path(Array(6).fill(100));
  ctx.fillStyle = "#F3F1EC";
  ctx.fill();
  ctx.strokeStyle = "#DAD6CC";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  for (const g of [25, 50, 75]) {
    path(Array(6).fill(g));
    ctx.strokeStyle = "#E4E0D7";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  post.forEach((s, i) => {
    const [x, y] = pt(i, 100);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = (s?.color ?? "#999") + "55";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  });
  // After: face-coloured wedges and edges
  const postVals = post.map((s) => s?.score ?? 0);
  post.forEach((s, i) => {
    const a = pt(i, postVals[i]);
    const b = pt((i + 1) % n, postVals[(i + 1) % n]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.closePath();
    ctx.fillStyle = (s?.color ?? "#999") + "33";
    ctx.fill();
  });
  // Before: dashed grey with hollow markers
  path(pre.map((s) => s?.score ?? 0));
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = "#5F5F5F";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
  pre.forEach((s, i) => {
    const [x, y] = pt(i, s?.score ?? 0);
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#5F5F5F";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  });
  post.forEach((s, i) => {
    const a = pt(i, postVals[i]);
    const b = pt((i + 1) % n, postVals[(i + 1) % n]);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.strokeStyle = s?.color ?? "#333";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.stroke();
  });
  post.forEach((s, i) => {
    const [x, y] = pt(i, postVals[i]);
    ctx.beginPath();
    ctx.arc(x, y, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = s?.color ?? "#333";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = s?.color ?? "#333";
    ctx.fill();
  });
  // Labels: name + before → after
  post.forEach((s, i) => {
    if (!s) return;
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const vertical = Math.abs(cos) < 0.01;
    const rr = radius + (vertical ? 18 : 16);
    const x = cx + rr * cos;
    const y = cy + rr * sin;
    ctx.textAlign = vertical ? "center" : cos > 0 ? "left" : "right";
    const nameY = vertical ? (sin < 0 ? y - 22 : y + 4) : y - 8;
    ctx.textBaseline = "top";
    ctx.font = `700 17px ${sans}`;
    ctx.fillStyle = s.color;
    ctx.fillText(s.name, x, nameY);
    ctx.font = `500 15px ${sans}`;
    ctx.fillStyle = "#4A4A4A";
    ctx.fillText(`${Math.round(pre[i]?.score ?? 0)} → ${Math.round(s.score)}`, x, nameY + 20);
  });
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: string, family: string, start: number, min: number, maxW: number): number {
  let size = start;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > min) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

export async function renderCertificateShareImage(cert: CertificateData, scale = 2): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_W * scale;
  canvas.height = SHARE_H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  ctx.scale(scale, scale);
  const sans = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const serif = "Georgia, 'Times New Roman', Times, serif";
  if (document.fonts?.ready) await document.fonts.ready;

  // Paper, frame and six-colour top rule
  ctx.fillStyle = "#FCFBF8";
  ctx.fillRect(0, 0, SHARE_W, SHARE_H);
  const colors = constructs.map((c) => c.color);
  const segW = SHARE_W / colors.length;
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(i * segW, 0, segW + 1, 10);
  });
  ctx.strokeStyle = "#D8D2C4";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(24, 34, SHARE_W - 48, SHARE_H - 58);

  const left = 64;
  const colW = 600;
  const logo = await loadImage("/brand/logo.png");
  if (logo) {
    const lw = 230;
    ctx.drawImage(logo, left, 64, lw, (lw * logo.naturalHeight) / logo.naturalWidth);
  } else {
    drawMark(ctx, left + 24, 88, 24);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#5C5A56";
  ctx.font = `700 15px ${sans}`;
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "4px";
  ctx.fillText("CERTIFICATE OF COMPLETION", left, 170);
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

  const name = cert.learnerName?.trim() || "Super-Cube® Learner";
  ctx.fillStyle = "#141416";
  fitFont(ctx, name, "700", serif, 60, 34, colW);
  ctx.fillText(name, left, 240);

  ctx.fillStyle = "#141416";
  ctx.font = `600 26px ${sans}`;
  ctx.fillText(programmeName(cert.programmeId), left, 290);

  // Scores
  const scores: [string, string][] = [
    ["Before", String(round1(cert.preOverall))],
    ["After", String(round1(cert.postOverall))],
    ["Growth", signed(cert.growth)],
  ];
  scores.forEach(([label, value], i) => {
    const x = left + i * 150;
    ctx.fillStyle = "#141416";
    ctx.font = `700 44px ${sans}`;
    ctx.fillText(value, x, 372);
    ctx.fillStyle = "#5C5A56";
    ctx.font = `500 16px ${sans}`;
    ctx.fillText(label, x, 398);
  });

  ctx.fillStyle = "#141416";
  ctx.font = `italic 400 26px ${serif}`;
  ctx.fillText(CERT_AUTHOR, left, 470);
  ctx.strokeStyle = "#141416";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, 482);
  ctx.lineTo(left + 300, 482);
  ctx.stroke();
  ctx.fillStyle = "#5C5A56";
  ctx.font = `500 15px ${sans}`;
  ctx.fillText(`${CERT_AUTHOR_ROLE} · Awarded ${formatIssuedDate(cert.issuedAt)}`, left, 506);

  ctx.font = `600 16px ${sans}`;
  ctx.fillStyle = "#141416";
  ctx.fillText(`Verify: ${verifyDisplay(cert.id, cert.siteOrigin)}`, left, 560);

  // Right: before/after radar (or the cube mark)
  if (cert.preFaces?.length && cert.postFaces?.length) {
    drawRadar(ctx, 940, 330, 165, cert.preFaces, cert.postFaces, sans);
  } else {
    drawMark(ctx, 940, 320, 150);
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("png_failed"))), "image/png"),
  );
}
