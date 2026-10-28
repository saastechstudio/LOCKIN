import Image from "next/image";

import { cn } from "@/lib/utils";

type PhotoFrameProps = {
  /** Vraie photo uniquement (lieu ou membre réel). Absente : cadre d'attente étiqueté. */
  src?: string;
  alt: string;
  /** Crédit photographe, affiché en légende. */
  credit?: string;
  /** Ce que la photo devra montrer, tant qu'elle manque. */
  placeholder?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Légende d'attente en haut, quand un autre cadre recouvre le bas. */
  captionTop?: boolean;
};

/** Cadre photo du club : coins 20 px, tonalité chaude. Sans photo, un cadre pierre honnête plutôt qu'une image de banque. */
export function PhotoFrame({ src, alt, credit, placeholder, className, sizes, priority, captionTop = false }: PhotoFrameProps) {
  return (
    <figure className={cn("relative overflow-hidden rounded-[20px]", className)}>
      {src ? (
        <>
          <Image src={src} alt={alt} fill sizes={sizes ?? "50vw"} priority={priority} className="object-cover" />
          {credit ? (
            <figcaption className="absolute bottom-3 left-4 text-[10px] tracking-[0.2em] text-club-ivory/70 uppercase">
              Photo · {credit}
            </figcaption>
          ) : null}
        </>
      ) : (
        <div
          role="img"
          aria-label={alt}
          className={cn(
            "club-grain flex h-full w-full flex-col bg-[linear-gradient(160deg,var(--club-pierre)_0%,var(--club-pierre-soft)_55%,var(--club-concrete)_130%)] p-5",
            captionTop ? "justify-start" : "justify-end",
          )}
        >
          <span className="text-[10px] font-medium tracking-[0.24em] text-club-ink-soft/80 uppercase">
            Photo à venir
          </span>
          {placeholder ? <span className="mt-1 text-[12px] leading-snug text-club-ink-soft/70">{placeholder}</span> : null}
        </div>
      )}
    </figure>
  );
}
