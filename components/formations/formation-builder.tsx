"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  addChapter,
  addModule,
  addResource,
  deleteChapter,
  deleteModule,
  deleteResource,
  renameChapter,
  renameModule,
  reorderChapters,
  reorderModules,
  reorderResources,
  updateResource,
} from "@/lib/actions/formation-builder";
import {
  FORMATION_LIMITS,
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  type ResourceType,
} from "@/lib/formations-data";
import { LockinButton, LockinInput, LockinTextarea } from "@/components/lockin/lockin-ui";
import { SortableList } from "@/components/formations/sortable-list";
import { FormError, useAction } from "@/components/formations/use-action";

type BuilderResource = { id: number; type: string; title: string; content: string; position: number };
type BuilderChapter = { id: number; title: string; position: number; resources: BuilderResource[] };
type BuilderModule = { id: number; title: string; position: number; chapters: BuilderChapter[] };

const listKey = (items: { id: number; position: number }[]) => items.map((i) => `${i.id}:${i.position}`).join(",");

const iconButton =
  "flex size-7 shrink-0 items-center justify-center border border-lk-line text-lk-black transition-colors hover:bg-lk-black hover:text-lk-white disabled:opacity-40";

/** Champ d'ajout en une ligne : « Nouveau module… » + bouton rectangulaire. */
function AddInline({
  placeholder,
  onAdd,
  disabledReason,
}: {
  placeholder: string;
  onAdd: (title: string) => ReturnType<typeof addModule>;
  disabledReason?: string;
}) {
  const { run, pending, error } = useAction();
  const [title, setTitle] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        run(() => onAdd(title), () => setTitle(""));
      }}
      className="space-y-2"
    >
      <div className="flex gap-2">
        <LockinInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={FORMATION_LIMITS.title}
          placeholder={placeholder}
          aria-label={placeholder}
          disabled={Boolean(disabledReason)}
        />
        <LockinButton type="submit" disabled={pending || !title.trim() || Boolean(disabledReason)} aria-label="Ajouter">
          <Plus className="size-4" /> Ajouter
        </LockinButton>
      </div>
      {disabledReason ? <p className="text-xs text-lk-stone-3">{disabledReason}</p> : null}
      <FormError message={error} />
    </form>
  );
}

/** Titre modifiable en place : enregistré à la sortie du champ s'il a changé. */
function RenameField({
  value,
  label,
  onRename,
}: {
  value: string;
  label: string;
  onRename: (title: string) => ReturnType<typeof renameModule>;
}) {
  const { run, error } = useAction();
  return (
    <div className="min-w-0 flex-1">
      <LockinInput
        defaultValue={value}
        aria-label={label}
        maxLength={FORMATION_LIMITS.title}
        onBlur={(e) => {
          const next = e.target.value.trim();
          if (next && next !== value) run(() => onRename(next));
          else e.target.value = value;
        }}
      />
      <FormError message={error} />
    </div>
  );
}

function ResourceForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: { type: ResourceType; title: string; content: string; typeLocked: boolean };
  submitLabel: string;
  onSubmit: (value: { type: ResourceType; title: string; content: string }) => ReturnType<typeof addResource>;
  onCancel?: () => void;
}) {
  const { run, pending, error } = useAction();
  const [type, setType] = useState<ResourceType>(initial.type);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () => onSubmit({ type, title, content }),
          () => {
            if (!onCancel) {
              setTitle("");
              setContent("");
            } else onCancel();
          },
        );
      }}
      className="space-y-3 border border-lk-line p-4"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <select
          className="lockin-input"
          aria-label="Type de ressource"
          value={type}
          disabled={initial.typeLocked}
          onChange={(e) => setType(e.target.value as ResourceType)}
        >
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {RESOURCE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <LockinInput
          className="sm:col-span-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={FORMATION_LIMITS.title}
          placeholder="Titre de la ressource"
          aria-label="Titre de la ressource"
          required
        />
      </div>
      {type === "text" ? (
        <LockinTextarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={FORMATION_LIMITS.textContent}
          rows={6}
          placeholder="Le contenu, en texte brut."
          aria-label="Contenu"
          required
        />
      ) : (
        <LockinInput
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={FORMATION_LIMITS.urlContent}
          placeholder="https://… (lien vers la vidéo, l'audio ou le PDF)"
          aria-label="Adresse https de la ressource"
          inputMode="url"
          required
        />
      )}
      <FormError message={error} />
      <div className="flex gap-3">
        <LockinButton type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : submitLabel}
        </LockinButton>
        {onCancel ? (
          <LockinButton variant="outline" onClick={onCancel}>
            Annuler
          </LockinButton>
        ) : null}
      </div>
    </form>
  );
}

function ResourceBlock({ resource, controls }: { resource: BuilderResource; controls: React.ReactNode }) {
  const { run, pending, error } = useAction();
  const [editing, setEditing] = useState(false);
  const type = (RESOURCE_TYPES as readonly string[]).includes(resource.type) ? (resource.type as ResourceType) : "text";

  if (editing) {
    return (
      <ResourceForm
        initial={{ type, title: resource.title, content: resource.content, typeLocked: true }}
        submitLabel="Enregistrer"
        onSubmit={(v) => updateResource(resource.id, { title: v.title, content: v.content })}
        onCancel={() => setEditing(false)}
      />
    );
  }
  return (
    <div className="flex items-start gap-3 border border-lk-line bg-lk-white p-3">
      {controls}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-lk-stone-3 uppercase">{RESOURCE_TYPE_LABELS[type]}</p>
        <p className="text-sm font-medium text-lk-black">{resource.title}</p>
        <p className="mt-1 truncate text-xs text-lk-stone-3">{resource.content}</p>
        <FormError message={error} />
      </div>
      <button type="button" onClick={() => setEditing(true)} className="text-xs text-lk-black underline underline-offset-4">
        Modifier
      </button>
      <button
        type="button"
        aria-label={`Supprimer la ressource ${resource.title}`}
        disabled={pending}
        onClick={() => {
          if (window.confirm("Supprimer cette ressource ?")) run(() => deleteResource(resource.id));
        }}
        className={iconButton}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function ChapterBlock({ chapter, controls }: { chapter: BuilderChapter; controls: React.ReactNode }) {
  const { run, pending, error } = useAction();
  const [bump, setBump] = useState(0);
  const [adding, setAdding] = useState(false);

  return (
    <div className="border border-lk-line bg-lk-white">
      <div className="flex items-start gap-3 border-b border-lk-line p-3">
        {controls}
        <RenameField value={chapter.title} label="Titre du chapitre" onRename={(t) => renameChapter(chapter.id, t)} />
        <button
          type="button"
          aria-label={`Supprimer le chapitre ${chapter.title}`}
          disabled={pending}
          onClick={() => {
            if (window.confirm("Supprimer ce chapitre et ses ressources ?")) run(() => deleteChapter(chapter.id));
          }}
          className={iconButton}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="space-y-3 p-3">
        <FormError message={error} />
        {chapter.resources.length === 0 ? (
          <p className="text-xs text-lk-stone-3">Aucune ressource. Ajoute un texte, une vidéo, un audio ou un PDF.</p>
        ) : (
          <SortableList
            key={`${listKey(chapter.resources)}:${bump}`}
            items={chapter.resources}
            itemLabel="la ressource"
            onReorder={(ids) => run(() => reorderResources(chapter.id, ids), undefined)}
            renderItem={(resource, resourceControls) => <ResourceBlock resource={resource} controls={resourceControls} />}
          />
        )}
        {adding ? (
          <ResourceForm
            initial={{ type: "text", title: "", content: "", typeLocked: false }}
            submitLabel="Ajouter la ressource"
            onSubmit={(v) => addResource(chapter.id, v)}
            onCancel={() => {
              setAdding(false);
              setBump((b) => b + 1);
            }}
          />
        ) : (
          <LockinButton
            variant="outline"
            onClick={() => setAdding(true)}
            disabled={chapter.resources.length >= FORMATION_LIMITS.resourcesPerChapter}
          >
            <Plus className="size-4" /> Ajouter une ressource
          </LockinButton>
        )}
      </div>
    </div>
  );
}

function ModuleBlock({ module, index, controls }: { module: BuilderModule; index: number; controls: React.ReactNode }) {
  const { run, pending, error } = useAction();

  return (
    <section className="border border-lk-line bg-lk-white">
      <header className="flex items-start gap-3 border-b border-lk-line bg-lk-mist p-4">
        {controls}
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-lk-stone-3 uppercase">
            Module {String(index + 1).padStart(2, "0")}
          </p>
          <RenameField value={module.title} label="Titre du module" onRename={(t) => renameModule(module.id, t)} />
        </div>
        <button
          type="button"
          aria-label={`Supprimer le module ${module.title}`}
          disabled={pending}
          onClick={() => {
            if (window.confirm("Supprimer ce module, ses chapitres et leurs ressources ?")) run(() => deleteModule(module.id));
          }}
          className={iconButton}
        >
          <Trash2 className="size-4" />
        </button>
      </header>
      <div className="space-y-4 p-4">
        <FormError message={error} />
        {module.chapters.length === 0 ? (
          <p className="text-sm text-lk-stone-3">Aucun chapitre dans ce module.</p>
        ) : (
          <SortableList
            key={listKey(module.chapters)}
            items={module.chapters}
            itemLabel="le chapitre"
            onReorder={(ids) => run(() => reorderChapters(module.id, ids))}
            renderItem={(chapter, chapterControls) => <ChapterBlock chapter={chapter} controls={chapterControls} />}
          />
        )}
        <AddInline
          placeholder="Nouveau chapitre…"
          onAdd={(title) => addChapter(module.id, title)}
          disabledReason={
            module.chapters.length >= FORMATION_LIMITS.chaptersPerModule
              ? `Maximum ${FORMATION_LIMITS.chaptersPerModule} chapitres par module.`
              : undefined
          }
        />
      </div>
    </section>
  );
}

/** L'éditeur : modules → chapitres → ressources, tout en blocs rectangulaires réordonnables. */
export function FormationBuilder({ formationId, modules }: { formationId: number; modules: BuilderModule[] }) {
  const { run, error } = useAction();

  return (
    <div className="space-y-6">
      <FormError message={error} />
      {modules.length === 0 ? (
        <div className="border border-dashed border-lk-line p-8 text-center text-sm text-lk-stone-3">
          Le squelette est vide. Ajoute ton premier module : un grand thème de ta formation.
        </div>
      ) : (
        <SortableList
          key={listKey(modules)}
          items={modules}
          itemLabel="le module"
          className="space-y-6"
          onReorder={(ids) => run(() => reorderModules(formationId, ids))}
          renderItem={(module, controls, index) => <ModuleBlock module={module} index={index} controls={controls} />}
        />
      )}
      <AddInline
        placeholder="Nouveau module…"
        onAdd={(title) => addModule(formationId, title)}
        disabledReason={
          modules.length >= FORMATION_LIMITS.modules ? `Maximum ${FORMATION_LIMITS.modules} modules par formation.` : undefined
        }
      />
    </div>
  );
}
