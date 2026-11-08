import type { LucideIcon } from "lucide-react";

import { AnimatedIcon } from "@/components/ui/animated-icon";
import { cn } from "@/lib/utils";

/**
 * Carte « pilier » : fond blanc, filet chaud #FFFFFF, ombre ultra-douce.
 * Au survol : la bordure passe au blanc rosé, la carte se soulève de 2 px, son
 * ombre se diffuse et l'icône line-art se redessine (`group` + .lk-draw).
 */
export function FeatureCard({
  icon,
  index,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  index?: number;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "lk-glass lk-lift group flex h-full flex-col rounded-2xl p-8",
        "hover:border-lk-gold focus-within:border-lk-gold",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="flex size-12 items-center justify-center rounded-xl bg-lk-mist text-lk-blue-soft transition-colors duration-300 group-hover:bg-lk-gold/15">
          <AnimatedIcon icon={icon} className="size-6" />
        </span>
        {index !== undefined ? (
          <span className="text-xs font-medium text-lk-stone-2 tabular-nums transition-colors duration-300 group-hover:text-lk-gold">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      <h3 className="font-display mt-10 text-2xl text-lk-black">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-lk-stone-3">{description}</p>
    </article>
  );
}
