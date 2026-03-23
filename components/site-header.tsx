import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
            pL
          </div>
          <div>
            <div className="font-display text-xl">{APP_NAME}</div>
            <div className="text-xs text-white/60">Research search, shaped around how students think</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          <Link href="/search" className="transition hover:text-white">
            Search
          </Link>
          <Link href="/assistant" className="transition hover:text-white">
            Compare &amp; Chat
          </Link>
          <Link href="/results?topic=How%20does%20urban%20greening%20affect%20heat%20islands%20in%20dense%20cities%3F" className="transition hover:text-white">
            Sample results
          </Link>
          <Link href="/saved" className="transition hover:text-white">
            Shortlist
          </Link>
        </nav>
        <ButtonLink href="/saved" variant="secondary" className="text-sm">
          Open shortlist
        </ButtonLink>
      </div>
    </header>
  );
}
