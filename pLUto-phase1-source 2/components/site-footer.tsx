import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-[#f0ede6]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 text-sm text-ink/60 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-display text-lg text-ink">{APP_NAME}</p>
          <p>Academic discovery for students, designed around tighter questions and clearer source choices.</p>
        </div>
        <div className="flex flex-wrap gap-5">
          <Link href="/" className="transition hover:text-ink">
            Home
          </Link>
          <Link href="/search" className="transition hover:text-ink">
            Search
          </Link>
          <Link href="/saved" className="transition hover:text-ink">
            Shortlist
          </Link>
        </div>
      </div>
    </footer>
  );
}
