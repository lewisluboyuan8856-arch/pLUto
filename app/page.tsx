import type { Metadata } from "next";
import { ArrowRight, BookOpenText, BrainCircuit, SearchCheck, Sparkles } from "lucide-react";

import { AskPlutoHero } from "@/components/home/ask-pluto-hero";
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
    title: "AI starts the workflow",
    copy:
      "The homepage now behaves like a live research prompt, so students can begin with a question, argument, or comparison instead of hunting for the right keyword formula first."
  },
  {
    title: "Results act like a research brief",
    copy:
      "The results experience is built around an intelligent overview, source picks, trust signals, and essay-oriented guidance rather than an undifferentiated list of cards."
  },
  {
    title: "The copilot stays grounded",
    copy:
      "Compare and chat features stay explicitly tied to the selected papers and metadata already visible inside pLUto."
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
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="border-white/15 bg-white/10 text-white">
                {MOCK_MODE_LABEL}
              </Badge>
              <p className="text-sm text-white/62">
                Search, compare, save, and ask grounded questions from one student-first workflow.
              </p>
            </div>

            <AskPlutoHero />

            <div className="rounded-[1.8rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                    Fast starts
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/72">
                    Sample topics that show how pLUto works across essays, projects, and narrow
                    academic questions.
                  </p>
                </div>
                <ButtonLink
                  href="/results?topic=What%20are%20the%20ethical%20trade-offs%20of%20gene%20editing%20in%20agriculture%3F"
                  variant="secondary"
                >
                  Explore sample results
                </ButtonLink>
              </div>
              <div className="mt-5">
                <TopicPills topics={featuredTopics} dark />
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

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div className="rounded-[2.25rem] bg-ink p-10 text-white shadow-glow">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
            Why pLUto feels different
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight">
            It behaves like a research dashboard, not a blank search box plus cards.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/74">
            Students can search live academic sources, compare selected papers, see which source is
            most useful for an essay, and move straight into grounded synthesis without leaving the
            workflow.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
              <SearchCheck className="h-6 w-6 text-coral" />
              <p className="mt-4 text-xl font-semibold">Live search</p>
              <p className="mt-2 text-sm text-white/68">OpenAlex-first with fallback resilience</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
              <BrainCircuit className="h-6 w-6 text-sage" />
              <p className="mt-4 text-xl font-semibold">Research copilot</p>
              <p className="mt-2 text-sm text-white/68">Grounded compare, chat, and essay support</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
              <BookOpenText className="h-6 w-6 text-gold" />
              <p className="mt-4 text-xl font-semibold">Shortlist memory</p>
              <p className="mt-2 text-sm text-white/68">Saved papers, notes, and citations stay close</p>
            </div>
          </div>
        </div>
        <div className="grid gap-5">
          {[
            "Start with a natural-language research question on the homepage",
            "Get an AI-style overview of the topic before scanning individual papers",
            "See which source is strongest, most reliable, and most beginner-friendly",
            "Select papers into Compare & Chat directly from the results flow",
            "Use quality indicators to judge citation strength, recency, and evidence type",
            "Keep auth, saved papers, citations, and deployment readiness intact"
          ].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-[1.5rem] border border-ink/10 bg-white px-6 py-5 shadow-card"
            >
              <span className="text-sm font-medium text-ink/72">{item}</span>
              <ArrowRight className="h-4 w-4 text-coral" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
