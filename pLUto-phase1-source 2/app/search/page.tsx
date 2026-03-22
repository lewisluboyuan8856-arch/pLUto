import { SearchForm } from "@/components/search/search-form";
import { TopicPills } from "@/components/search/topic-pills";
import { Badge } from "@/components/ui/badge";
import { MOCK_MODE_LABEL } from "@/lib/constants";
import { getFeaturedMockTopics } from "@/lib/search/mock-data";

export const metadata = {
  title: "Search"
};

export default function SearchPage() {
  const featuredTopics = getFeaturedMockTopics();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <div className="space-y-6">
        <Badge>{MOCK_MODE_LABEL}</Badge>
        <h1 className="max-w-3xl font-display text-5xl text-ink">
          Ask the awkward version of the question first.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-ink/65">
          This Phase 1 search flow is powered by curated mock data, but the interface already
          behaves like the final product: query shaping, level-aware filters, ranked results,
          article detail views, and a saved shortlist.
        </p>
      </div>

      <div className="mt-10 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
        <SearchForm />
      </div>

      <div className="mt-8 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
          Try one of these research prompts
        </p>
        <TopicPills topics={featuredTopics} className="mt-4" />
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Secondary",
            copy: "Biases the shortlist toward clearer summaries, review papers, and approachable entry points."
          },
          {
            title: "JC-IB",
            copy: "Balances rigor with readability so papers still feel usable for essays and coursework."
          },
          {
            title: "Undergraduate",
            copy: "Pushes more specialist sources higher while keeping the reasoning and summaries easy to scan."
          }
        ].map((item) => (
          <div key={item.title} className="rounded-[1.5rem] border border-ink/10 bg-paper p-6">
            <h2 className="font-display text-2xl text-ink">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/70">{item.copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
