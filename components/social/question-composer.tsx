"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { createQuestion } from "@/lib/actions/help";
import { LOCKIN_TAGS, type LockinTag } from "@/lib/social/data";

/** Composeur de question Entraide — titre, corps, tags à cocher. */
export function QuestionComposer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<LockinTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleTag(tag: LockinTag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleSubmit() {
    if (!title.trim() || !body.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const question = await createQuestion({ title: title.trim(), body: body.trim(), tags });
        setTitle("");
        setBody("");
        setTags([]);
        setOpen(false);
        if (question) router.push(`/dashboard/entraide/${question.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de publier cette question.");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 border border-lk-line bg-camp-gold px-5 py-2.5 text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase"
      >
        Poser une question
      </button>
    );
  }

  return (
    <div className="mb-6 space-y-3 border-b border-lk-line pb-6">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ta question en une phrase"
        className="w-full border border-camp-hairline bg-camp-white px-4 py-2.5 text-sm font-medium text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-lk-line"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Détaille le contexte…"
        className="w-full resize-none border border-camp-hairline bg-camp-white px-4 py-3 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-lk-line"
      />
      {error ? (
        <p className="border border-lk-line bg-camp-cream px-4 py-2.5 text-sm text-camp-charcoal">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {LOCKIN_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={cn(
              "border px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] uppercase",
              tags.includes(tag)
                ? "border-lk-line bg-camp-charcoal text-camp-white"
                : "border-camp-hairline text-lk-stone-3",
            )}
          >
            {tag}
          </button>
        ))}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !title.trim() || !body.trim()}
          className="ml-auto border border-lk-line bg-camp-gold px-5 py-1.5 text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
        >
          Publier
        </button>
      </div>
    </div>
  );
}
