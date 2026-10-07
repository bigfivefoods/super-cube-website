import { PricingView } from "@/components/pricing/PricingView";
import { pricingStrings } from "@/lib/i18n/pages/pricing";

export default function PricingPage() {
  return <PricingView s={pricingStrings("en")} />;
}
