/** "{name}" placeholders → values (page strings; server and client safe). */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/**
 * Split a template around one "{slot}" so a styled element (a <strong>, a link) can sit where each
 * language puts it: "Payments by {paystack}." → ["Payments by ", "."].
 */
export function around(template: string, slot: string): [string, string] {
  const i = template.indexOf(`{${slot}}`);
  if (i < 0) return [template, ""];
  return [template.slice(0, i), template.slice(i + slot.length + 2)];
}
