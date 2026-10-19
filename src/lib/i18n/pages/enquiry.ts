import type { EnquiryField } from "@/components/EnquiryForm";
import { ENQUIRY_FORM_EN, type EnquiryFormStrings } from "@/components/enquiry-strings";
import type { T } from "./t";

/** EnquiryForm fields for a page in another language: shown labels/options translated, submitted values English. */
export function localizeEnquiryFields(t: T, fields: EnquiryField[]): EnquiryField[] {
  return fields.map((f) => ({
    ...f,
    displayLabel: t(f.label),
    optionLabels: f.options?.map((o) => t(o)),
    placeholder: t(f.placeholder),
  }));
}

/** EnquiryForm's own words in the page language. */
export function enquiryStrings(t: T): EnquiryFormStrings {
  return Object.fromEntries(Object.entries(ENQUIRY_FORM_EN).map(([k, v]) => [k, t(v)])) as EnquiryFormStrings;
}
