"use server";

import { revalidatePath } from "next/cache";

import type { ResearchArticle } from "@/lib/types";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { upsertSavedPaperForUser } from "@/lib/saved-papers";

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
  try {
    await upsertSavedPaperForUser(userId, article);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to save paper."
    };
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
