import { ChapterCard } from "@/components/formations/chapter-card";

type ModuleCardProps = {
  module: {
    id: number;
    title: string;
    chapters: React.ComponentProps<typeof ChapterCard>["chapter"][];
  };
  index: number;
  canTrack: boolean;
  nextChapterId: number | null;
};

/** Un module : un bloc à filet noir, ses chapitres dedans, son avancement en en-tête. */
export function ModuleCard({ module, index, canTrack, nextChapterId }: ModuleCardProps) {
  const done = module.chapters.filter((c) => c.done).length;
  return (
    <section className="border border-lk-black">
      <header className="flex items-baseline justify-between gap-4 border-b border-lk-black bg-lk-mist px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-black/50 uppercase">
            Module {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="font-display text-lg text-lk-black">{module.title}</h2>
        </div>
        <span className="shrink-0 text-xs text-lk-black/60 tabular-nums">
          {done}/{module.chapters.length}
        </span>
      </header>
      {module.chapters.length === 0 ? (
        <p className="px-4 py-4 text-sm text-lk-black/50">Ce module est encore vide.</p>
      ) : (
        module.chapters.map((chapter, i) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            index={i}
            canTrack={canTrack}
            defaultOpen={chapter.id === nextChapterId}
          />
        ))
      )}
    </section>
  );
}
