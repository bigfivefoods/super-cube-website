import type { Metadata } from "next";
import { BookView, META, SHARE_IMAGE_ALT } from "@/components/pages/Book";
import { BOOK } from "@/lib/book";
import { pageMeta } from "@/lib/seo";

const base = pageMeta(META);
const shareImage = { ...BOOK.share, alt: SHARE_IMAGE_ALT };

export const metadata: Metadata = {
  ...base,
  openGraph: { ...base.openGraph, type: "book", images: [shareImage] },
  twitter: { ...base.twitter, images: [shareImage.url] },
};

export default function BookPage() {
  return <BookView />;
}
