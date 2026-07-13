import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
      <p className="eyebrow justify-center">404</p>
      <h1 className="heading-lg mt-4 text-ink">This face of the cube is empty.</h1>
      <p className="mt-4 max-w-md text-slate leading-relaxed">
        The page you requested does not exist. Return home or explore the Super-Cube®
        model.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/" variant="primary">
          Home
        </Button>
        <Button href="/the-model" variant="ghost">
          The Model
        </Button>
      </div>
    </section>
  );
}
