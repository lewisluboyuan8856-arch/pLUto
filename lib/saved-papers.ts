import { buildApaCitation, buildMlaCitation } from "@/lib/citations";
import type { ResearchArticle, SavedPaperRecord } from "@/lib/types";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!hasSupabaseEnv()) return null;
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function getSavedPapers(): Promise<SavedPaperRecord[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("saved_papers")
    .select("*, note:notes(id, content)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as Array<SavedPaperRecord & { note?: SavedPaperRecord["note"] | SavedPaperRecord["note"][] }>).map(
    (paper) => ({
      ...paper,
      note: Array.isArray(paper.note) ? paper.note[0] || null : paper.note || null
    })
  );
}

export function buildArticleFromSavedPaperRecord(record: SavedPaperRecord): ResearchArticle {
  if (record.article_payload && typeof record.article_payload === "object") {
    return record.article_payload;
  }

  return {
    id: record.article_id,
    externalIds: {},
    title: record.title,
    authors: record.authors,
    year: record.year,
    journal: record.journal,
    abstract: "Abstract unavailable.",
    url: record.article_url,
    isOpenAccess: record.tags.includes("Open access"),
    isReviewArticle: record.tags.includes("Review article"),
    citationCount: undefined,
    source: "Mock",
    concepts: [],
    relevanceScore: 0,
    studentFitScore: 0,
    recencyScore: 0,
    whyRelevant: record.why_relevant,
    plainEnglishSummary: record.summary,
    difficulty:
      record.difficulty === "Accessible" ||
      record.difficulty === "Intermediate" ||
      record.difficulty === "Advanced"
        ? record.difficulty
        : "Intermediate",
    tags: record.tags
  };
}

export async function upsertSavedPaperForUser(
  userId: string,
  article: ResearchArticle,
  note?: string
) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("saved_papers")
    .upsert(
      {
        user_id: userId,
        article_id: article.id,
        article_payload: article,
        title: article.title,
        authors: article.authors,
        year: article.year,
        journal: article.journal,
        article_url: article.url,
        citation_apa: buildApaCitation(article),
        citation_mla: buildMlaCitation(article),
        why_relevant: article.whyRelevant,
        summary: article.plainEnglishSummary,
        difficulty: article.difficulty,
        tags: article.tags
      },
      { onConflict: "user_id,article_id" }
    )
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to save paper.");
  }

  const trimmedNote = (note || "").trim();
  if (trimmedNote) {
    const { error: noteError } = await supabase.from("notes").upsert(
      {
        user_id: userId,
        saved_paper_id: data.id,
        content: trimmedNote
      },
      { onConflict: "saved_paper_id" }
    );

    if (noteError) {
      throw new Error(noteError.message);
    }
  }

  return data.id;
}

export async function deleteSavedPaperByArticleId(userId: string, articleId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("saved_papers")
    .delete()
    .eq("user_id", userId)
    .eq("article_id", articleId);

  if (error) {
    throw new Error(error.message);
  }
}
