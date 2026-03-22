import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-8">
      <h1 className="font-display text-5xl text-ink">We couldn&apos;t find that article view.</h1>
      <p className="mt-4 text-lg leading-8 text-ink/65">
        Open article breakdowns from a results card or saved shortlist so pLUto can route you to a paper in the Phase 1 mock library.
      </p>
      <div className="mt-8 flex justify-center">
        <ButtonLink href="/search">Back to search</ButtonLink>
      </div>
    </div>
  );
}
