import type { Metadata } from "next";
import { ArrowRight, BookOpenText, BrainCircuit, SearchCheck, Sparkles } from "lucide-react";

import { SearchForm } from "@/components/search/search-form";
import { TopicPills } from "@/components/search/topic-pills";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, MOCK_MODE_LABEL } from "@/lib/constants";
import { getFeaturedMockTopics } from "@/lib/search/mock-data";
import { buildAbsoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/"
  }
};

const features = [
  {
    title: "Intent-aware search framing",
    copy:
      "pLUto starts from the question a student would really ask, then reshapes it into tighter academic language and clearer search angles."
  },
  {
    title: "Shortlists over endless tabs",
    copy:
      "Instead of flooding the page with barely related papers, the product is designed to surface a confident shortlist with explanation, fit, and trade-offs."
  },
  {
    title: "Built to explain, not just retrieve",
    copy:
      "Every result is still presented in student-friendly language, even when the underlying metadata comes from live academic APIs."
  }
];

export default function HomePage() {
  const featuredTopics = getFeaturedMockTopics();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description:
      "pLUto is an AI-powered research assistant that helps students sharpen research questions, understand paper relevance, and build a shortlist.",
    url: buildAbsoluteUrl("/"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };

  return (
    <div className="overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="bg-hero-grid text-white">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="space-y-8">
            <Badge className="border-white/15 bg-white/10 text-white">
              {MOCK_MODE_LABEL}
            </Badge>
            <div className="space-y-6">
              <h1 className="max-w-3xl font-display text-5xl leading-tight md:text-6xl">
                Research that starts where students do, then gets sharper fast.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/78">
                {APP_NAME} helps students turn messy topic ideas into stronger academic searches,
                rank live research results, and keep a clean shortlist with notes and citations.
                If live search fails, the app falls back gracefully so the workflow still works.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/search">Start searching</ButtonLink>
              <ButtonLink href="/results?topic=What%20are%20the%20ethical%20trade-offs%20of%20gene%20editing%20in%20agriculture%3F" variant="secondary">
                Explore sample results
              </ButtonLink>
            </div>
            <TopicPills topics={featuredTopics} dark />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                <SearchCheck className="h-6 w-6 text-coral" />
                <p className="mt-4 text-2xl font-semibold">OpenAlex-first search</p>
                <p className="mt-1 text-sm text-white/68">Live academic metadata with fallback</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                <BrainCircuit className="h-6 w-6 text-sage" />
                <p className="mt-4 text-2xl font-semibold">Query shaping</p>
                <p className="mt-1 text-sm text-white/68">Rewrites narrow student questions</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                <BookOpenText className="h-6 w-6 text-gold" />
                <p className="mt-4 text-2xl font-semibold">Shortlist workflow</p>
                <p className="mt-1 text-sm text-white/68">Save, note, and revisit papers</p>
              </div>
            </div>
          </div>

          <div className="self-center">
            <div className="surface-border rounded-[2rem] bg-white/10 p-[1px]">
              <div className="rounded-[2rem] bg-[#f4f3ef] p-5 text-ink shadow-glow">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/45">
                      Search preview
                    </p>
                    <h2 className="mt-2 font-display text-2xl">Start with the messy version</h2>
                  </div>
                  <Sparkles className="h-6 w-6 text-coral" />
                </div>
                <SearchForm compact initialTopic="How does urban greening affect heat islands in dense cities?" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[2rem] border border-ink/10 bg-white p-8 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                Feature
              </p>
              <h3 className="mt-5 font-display text-3xl text-ink">{feature.title}</h3>
              <p className="mt-4 text-sm leading-7 text-ink/68">{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="rounded-[2.25rem] bg-ink p-10 text-white shadow-glow">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
            Why pLUto works
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight">
            The research workflow stays focused even when the topic is narrow.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/74">
            Students can search live academic sources, read plain-English relevance notes, save
            useful papers, and return to a structured shortlist without juggling dozens of tabs.
          </p>
        </div>
        <div className="grid gap-5">
          {[
            "Turns vague prompts into stronger academic search angles",
            "Searches OpenAlex first and merges secondary metadata when available",
            "Presents ranked paper cards with relevance explanations",
            "Opens a dedicated article breakdown for deeper reading",
            "Lets users save papers and notes locally in-browser",
            "Falls back gracefully if live search is temporarily unavailable"
          ].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-[1.5rem] border border-ink/10 bg-white px-6 py-5 shadow-card">
              <span className="text-sm font-medium text-ink/72">{item}</span>
              <ArrowRight className="h-4 w-4 text-coral" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
