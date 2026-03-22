import type { SavedPaperRecord } from "@/lib/types";
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
