import { ChapterCheck } from "@/components/formations/chapter-check";
import { ResourceCard } from "@/components/formations/resource-card";
import { cn } from "@/lib/utils";

type ChapterCardProps = {
  chapter: {
    id: number;
    title: string;
    done: boolean;
    resources: { id: number; type: string; title: string; content: string; locked: boolean }[];
  };
  index: number;
  /** Peut-il cocher ? Seulement un inscrit. */
  canTrack: boolean;
  /** Ouvert par défaut : le prochain chapitre à faire. */
  defaultOpen?: boolean;
};

/**
 * Un chapitre : une coche à gauche, un bloc dépliable à droite. Le
 * dépliant natif (<details>) évite le défilement infini : on n'ouvre que
 * ce qu'on travaille.
 */
export function ChapterCard({ chapter, index, canTrack, defaultOpen }: ChapterCardProps) {
  return (
    <div id={`chapitre-${chapter.id}`} className="flex items-start gap-4 border-t border-lk-line px-4 py-4 first:border-t-0">
      <ChapterCheck chapterId={chapter.id} done={chapter.done} disabled={!canTrack} />
      <details open={defaultOpen} className="group min-w-0 flex-1">
        <summary className="flex cursor-pointer list-none items-baseline gap-3 marker:hidden">
          <span className="text-xs text-lk-gold tabular-nums">{String(index + 1).padStart(2, "0")}</span>
          <span className={cn("font-display text-base text-lk-black", chapter.done && "text-lk-stone-3 line-through")}>
            {chapter.title}
          </span>
          <span className="ml-auto text-xs text-lk-black/40 tabular-nums">
            {chapter.resources.length} ressource{chapter.resources.length > 1 ? "s" : ""}
          </span>
        </summary>
        <div className="mt-4 space-y-3">
          {chapter.resources.length === 0 ? (
            <p className="text-sm text-lk-stone-3">Aucune ressource dans ce chapitre pour l&apos;instant.</p>
          ) : (
            chapter.resources.map((r) => <ResourceCard key={r.id} resource={r} />)
          )}
        </div>
      </details>
    </div>
  );
}
