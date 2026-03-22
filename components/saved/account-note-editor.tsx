"use client";

import { useFormStatus } from "react-dom";

import { updateNoteAction } from "@/lib/actions/saved-papers";

function SaveNoteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/90"
      disabled={pending}
    >
      {pending ? "Saving..." : "Save note"}
    </button>
  );
}

export function AccountNoteEditor({
  savedPaperId,
  defaultValue
}: {
  savedPaperId: string;
  defaultValue?: string;
}) {
  return (
    <form action={updateNoteAction} className="space-y-3">
      <input type="hidden" name="savedPaperId" value={savedPaperId} />
      <textarea
        name="content"
        defaultValue={defaultValue || ""}
        rows={4}
        placeholder="Add your essay angle, method notes, or a quote to revisit later."
        className="w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm text-ink outline-none placeholder:text-ink/35"
      />
      <div className="flex items-center justify-between gap-3">
        <SaveNoteButton />
        <p className="text-xs text-ink/48">Saved to your account.</p>
      </div>
    </form>
  );
}
