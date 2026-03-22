"use server";

import { revalidatePath } from "next/cache";

import { buildApaCitation, buildMlaCitation } from "@/lib/citations";
import type { ResearchArticle } from "@/lib/types";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

async function getAuthenticatedUserId() {
  if (!hasSupabaseEnv()) return null;
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function savePaperAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const rawArticle = String(formData.get("article") || "");
  if (!rawArticle) return { success: false, message: "Missing article payload." };

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, message: "Please sign in to save papers." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { success: false, message: "Supabase is not configured." };
  }

  let article: ResearchArticle;
  try {
    article = JSON.parse(rawArticle) as ResearchArticle;
  } catch {
    return { success: false, message: "Invalid article payload." };
  }
  const { error } = await supabase.from("saved_papers").upsert(
    {
      user_id: userId,
      article_id: article.id,
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
  );

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/saved");
  return { success: true, message: "Paper saved to your dashboard." };
}

export async function deleteSavedPaperAction(formData: FormData) {
  const savedPaperId = String(formData.get("savedPaperId") || "");
  if (!savedPaperId) return;

  const userId = await getAuthenticatedUserId();
  if (!userId) return;

  const supabase = createSupabaseServerClient();
  if (!supabase) return;

  await supabase
    .from("saved_papers")
    .delete()
    .eq("id", savedPaperId)
    .eq("user_id", userId);

  revalidatePath("/saved");
}

export async function updateNoteAction(formData: FormData) {
  const savedPaperId = String(formData.get("savedPaperId") || "");
  const content = String(formData.get("content") || "").trim();
  if (!savedPaperId) return;

  const userId = await getAuthenticatedUserId();
  if (!userId) return;

  const supabase = createSupabaseServerClient();
  if (!supabase) return;

  if (!content) {
    await supabase
      .from("notes")
      .delete()
      .eq("saved_paper_id", savedPaperId)
      .eq("user_id", userId);
  } else {
    await supabase.from("notes").upsert(
      {
        user_id: userId,
        saved_paper_id: savedPaperId,
        content
      },
      { onConflict: "saved_paper_id" }
    );
  }

  revalidatePath("/saved");
}
