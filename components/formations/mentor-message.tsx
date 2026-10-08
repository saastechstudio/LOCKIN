import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";

/**
 * Un message du mode mentor : un auteur, un rôle, une date, des blocs
 * étiquetés. Ni like, ni réaction : on répond, on ne « valide » pas.
 */
export function MentorMessage({
  author,
  role,
  date,
  blocks,
}: {
  author: string;
  role: "apprenant" | "mentor";
  date: Date | null;
  blocks: { label: string; text: string }[];
}) {
  return (
    <div className={cn("border p-5", role === "mentor" ? "border-lk-line bg-lk-black text-lk-white" : "border-lk-line bg-lk-white text-lk-black")}>
      <p className={cn("flex flex-wrap items-baseline gap-x-3 text-[11px] font-semibold tracking-[0.2em] uppercase", role === "mentor" ? "text-lk-white/60" : "text-lk-stone-3")}>
        <span className={role === "mentor" ? "text-lk-gold" : undefined}>{role === "mentor" ? "Mentor" : "Apprenant"}</span>
        <span className="tracking-normal normal-case">
          {author}
          {date ? ` · ${formatDistanceToNow(date, { addSuffix: true, locale: fr })}` : ""}
        </span>
      </p>
      <div className="mt-4 space-y-4">
        {blocks.map((b) => (
          <div key={b.label}>
            <p className={cn("text-[10px] font-semibold tracking-[0.2em] uppercase", role === "mentor" ? "text-lk-white/50" : "text-lk-black/40")}>
              {b.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{b.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
