import { Button, PageHero } from "@/components/ui";

/** Unknown or unpublished post: a dark hero (the header is transparent on /news/*). */
export default function NewsPostNotFound() {
  return (
    <PageHero
      theme="leadership"
      eyebrow="Super-Cube® News"
      title="We couldn’t find that post"
      description="It may have moved or not be published yet. All our posts are on the News page."
    >
      <Button href="/news">All news</Button>
      <Button href="/" variant="light">
        Home
      </Button>
    </PageHero>
  );
}
