import { messageKey, type LmsCatalogue } from "./text";

/**
 * The strings a single Learn screen can look up. The page embeds this slice
 * (`#sc-lms-locale`) instead of the whole language catalogue.
 */
export function pickLmsCatalogue(catalogue: LmsCatalogue, keys: readonly string[]): LmsCatalogue {
  const out: LmsCatalogue = {};
  for (const raw of keys) {
    const key = messageKey(raw);
    const value = catalogue[key];
    if (value) out[key] = value;
  }
  return out;
}
