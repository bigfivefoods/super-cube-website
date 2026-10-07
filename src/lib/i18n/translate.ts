import en, { type Dict, type I18nKey } from "./dict/en";

export type Vars = Record<string, string | number>;

/** A string from `dict`, falling back to English per key, with {placeholders} filled in. */
export function translate(dict: Dict, key: I18nKey, vars?: Vars): string {
  let s = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
  }
  return s;
}
