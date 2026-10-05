import { Clapperboard, FileDown, FileText, Headphones, Lock } from "lucide-react";

import { Icon } from "@/components/lockin/icon";
import { RESOURCE_TYPE_LABELS, nativeMediaKind, type ResourceType } from "@/lib/formations-data";

const ICONS = { text: FileText, video: Clapperboard, audio: Headphones, pdf: FileDown } as const;

type ResourceCardProps = {
  resource: { id: number; type: string; title: string; content: string; locked: boolean };
};

/**
 * Une ressource. Le texte est rendu comme du texte (jamais comme du HTML) ;
 * un fichier média direct a son lecteur natif ; tout le reste s'ouvre par
 * un lien https dans un nouvel onglet — aucune iframe tierce.
 */
export function ResourceCard({ resource }: ResourceCardProps) {
  const type = (resource.type in ICONS ? resource.type : "text") as ResourceType;
  const media = resource.locked ? null : nativeMediaKind(type, resource.content);

  return (
    <div className="flex gap-4 border border-lk-line p-4">
      <Icon icon={resource.locked ? Lock : ICONS[type]} framed className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-black/50 uppercase">
          {RESOURCE_TYPE_LABELS[type]}
        </p>
        <p className="font-display mt-1 text-base text-lk-black">{resource.title}</p>

        {resource.locked ? (
          <p className="mt-2 text-sm text-lk-black/50">Réservé aux inscrits. Commence la formation pour y accéder.</p>
        ) : type === "text" ? (
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-lk-black/80">{resource.content}</p>
        ) : media === "video" ? (
          <video controls preload="none" src={resource.content} className="mt-3 w-full border border-lk-black" />
        ) : media === "audio" ? (
          <audio controls preload="none" src={resource.content} className="mt-3 w-full" />
        ) : (
          <a
            href={resource.content}
            target="_blank"
            rel="noopener noreferrer"
            className="lockin-button lockin-button--outline mt-3 inline-flex"
          >
            Ouvrir {type === "pdf" ? "le PDF" : type === "video" ? "la vidéo" : "l'audio"}
          </a>
        )}
      </div>
    </div>
  );
}
