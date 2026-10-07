/**
 * English labels for the one-learner checkout form. Kept apart from pricing.ts so the client
 * component that uses them as defaults does not pull in every language.
 */
/** Labels for the one-learner Paystack checkout form (src/components/PaystackCheckout.tsx). */
export type CheckoutFormStrings = {
  email: string;
  emailPlaceholder: string;
  name: string;
  namePlaceholder: string;
  /** {price} {programme} */
  pay: string;
  redirecting: string;
  unavailable: string;
  unavailableShort: string;
  /** {price} */
  secure: string;
  invalidEmail: string;
  couldNotStart: string;
  network: string;
};

export const CHECKOUT_FORM_EN: CheckoutFormStrings = {
  email: "Email (required for receipt)",
  emailPlaceholder: "you@school.co.za",
  name: "Name (optional)",
  namePlaceholder: "Your name",
  pay: "Pay {price} · unlock {programme}",
  redirecting: "Redirecting to Paystack…",
  unavailable:
    "Online checkout is temporarily unavailable. You can still start free on this device, or contact us to arrange access.",
  unavailableShort: "Online checkout is temporarily unavailable. Start free on this device or contact us.",
  secure: "Secure checkout via Paystack · {price} one-time · lifetime access · no subscription",
  invalidEmail: "Enter a valid email for your payment receipt.",
  couldNotStart: "Checkout could not start. Try again.",
  network: "Network error. Check your connection and try again.",
};
