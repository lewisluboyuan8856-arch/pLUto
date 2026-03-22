import { NextResponse } from "next/server";
import { z } from "zod";

import type { ResearchArticle } from "@/lib/types";
import { deleteSavedPaperByArticleId, getCurrentUser, upsertSavedPaperForUser } from "@/lib/saved-papers";
import { hasSupabaseEnv } from "@/lib/supabase/server";

const articleSchema = z.object({
  id: z.string().min(1),
  externalIds: z
    .object({
      doi: z.string().optional(),
      semanticScholarId: z.string().optional(),
      openAlexId: z.string().optional()
    })
    .default({}),
  title: z.string().min(1),
  authors: z.array(z.string()),
  year: z.number().optional(),
  journal: z.string().optional(),
  abstract: z.string(),
  url: z.string().min(1),
  pdfUrl: z.string().optional(),
  isOpenAccess: z.boolean(),
  isReviewArticle: z.boolean(),
  citationCount: z.number().optional(),
  source: z.enum(["Semantic Scholar", "OpenAlex", "Mock"]),
  concepts: z.array(z.string()),
  relevanceScore: z.number(),
  studentFitScore: z.number(),
  recencyScore: z.number(),
  whyRelevant: z.string(),
  plainEnglishSummary: z.string(),
  difficulty: z.enum(["Accessible", "Intermediate", "Advanced"]),
  tags: z.array(z.string()),
  limitations: z.array(z.string()).optional(),
  keyFindings: z.array(z.string()).optional(),
  suggestedUses: z.array(z.string()).optional(),
  followUpTerms: z.array(z.string()).optional()
});

const syncRequestSchema = z.object({
  papers: z.array(
    z.object({
      articleId: z.string().min(1),
      article: articleSchema,
      note: z.string().default(""),
      savedAt: z.string().optional()
    })
  )
});

const deleteRequestSchema = z.object({
  articleId: z.string().min(1)
});

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase authentication is disabled in this environment." },
      { status: 503 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = syncRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid saved paper payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    for (const paper of parsed.data.papers) {
      await upsertSavedPaperForUser(user.id, paper.article as ResearchArticle, paper.note);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to sync saved papers."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ synced: parsed.data.papers.length });
}

export async function DELETE(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase authentication is disabled in this environment." },
      { status: 503 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = deleteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid delete payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await deleteSavedPaperByArticleId(user.id, parsed.data.articleId);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to delete saved paper."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ deleted: parsed.data.articleId });
}
