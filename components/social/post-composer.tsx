"use client";

import { useState, useTransition } from "react";

import { createPost } from "@/lib/actions/feed";
import { LOCKIN_TAGS, SPORT_ACTIVITIES } from "@/lib/social/data";

type PostComposerProps = {
  groupId?: number;
  placeholder?: string;
};

/** Composeur de post brutaliste : zone de texte, tags optionnels, image par URL (pas d'upload). */
export function PostComposer({ groupId, placeholder = "Quoi de neuf ?" }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [sport, setSport] = useState("");
  const [country, setCountry] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageField, setShowImageField] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const value = content.trim();
    if (!value) return;
    startTransition(async () => {
      await createPost({
        content: value,
        imageUrl: imageUrl.trim() || undefined,
        tag: tag || undefined,
        sport: sport || undefined,
        country: country.trim() || undefined,
        groupId,
      });
      setContent("");
      setTag("");
      setSport("");
      setCountry("");
      setImageUrl("");
      setShowImageField(false);
    });
  }

  return (
    <div className="border-b-2 border-camp-charcoal pb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none border border-camp-hairline bg-camp-white px-4 py-3 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-camp-charcoal"
      />

      {showImageField ? (
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="URL de l'image"
          className="mt-2 w-full border border-camp-hairline bg-camp-white px-4 py-2.5 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-camp-charcoal"
        />
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="border border-camp-hairline bg-camp-white px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-camp-charcoal uppercase outline-none"
        >
          <option value="">Tag</option>
          {LOCKIN_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="border border-camp-hairline bg-camp-white px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-camp-charcoal uppercase outline-none"
        >
          <option value="">Sport</option>
          {SPORT_ACTIVITIES.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Pays"
          className="w-28 border border-camp-hairline bg-camp-white px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-camp-charcoal uppercase outline-none placeholder:text-camp-charcoal/40"
        />

        <button
          type="button"
          onClick={() => setShowImageField((s) => !s)}
          className="border border-camp-hairline px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-camp-charcoal/70 uppercase hover:text-camp-charcoal"
        >
          + Image
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="ml-auto border-2 border-camp-charcoal bg-camp-gold px-5 py-1.5 font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
        >
          Publier
        </button>
      </div>
    </div>
  );
}
