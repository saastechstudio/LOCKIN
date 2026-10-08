"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

type Controls = React.ReactNode;

/**
 * Liste réordonnable, rectangulaire et sobre : poignée de glisser-déposer
 * natif (HTML5, sans dépendance) + boutons haut/bas pour le clavier et le
 * tactile. L'ordre local est celui des `items` à l'instant du montage ;
 * le parent change la `key` quand les données serveur changent.
 */
export function SortableList<T extends { id: number }>({
  items,
  onReorder,
  renderItem,
  itemLabel,
  className,
}: {
  items: T[];
  onReorder: (orderedIds: number[]) => void;
  renderItem: (item: T, controls: Controls, index: number) => React.ReactNode;
  itemLabel: string;
  className?: string;
}) {
  const [order, setOrder] = useState(() => items.map((i) => i.id));
  const [dragId, setDragId] = useState<number | null>(null);

  const byId = new Map(items.map((i) => [i.id, i]));
  const ordered = order.map((id) => byId.get(id)).filter((i): i is T => Boolean(i));

  function commit(next: number[]) {
    setOrder(next);
    onReorder(next);
  }

  function move(id: number, delta: -1 | 1) {
    const from = order.indexOf(id);
    const to = from + delta;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    commit(next);
  }

  function dropOn(targetId: number) {
    if (dragId === null || dragId === targetId) return;
    const to = order.indexOf(targetId);
    const next = order.filter((id) => id !== dragId);
    next.splice(to, 0, dragId);
    commit(next);
  }

  const buttonClass =
    "flex size-7 items-center justify-center border border-lk-line text-lk-black transition-colors hover:bg-lk-black hover:text-lk-white disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className={cn("space-y-3", className)}>
      {ordered.map((item, index) => {
        const controls = (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              draggable
              aria-label={`Glisser pour déplacer ${itemLabel}`}
              title="Glisser pour déplacer"
              onDragStart={(e) => {
                e.stopPropagation();
                setDragId(item.id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(item.id));
                const block = (e.currentTarget as HTMLElement).closest("[data-sortable-item]");
                if (block) e.dataTransfer.setDragImage(block, 0, 0);
              }}
              onDragEnd={() => setDragId(null)}
              className={cn(buttonClass, "cursor-grab active:cursor-grabbing")}
            >
              <GripVertical className="size-4" />
            </button>
            <button type="button" aria-label={`Monter ${itemLabel}`} disabled={index === 0} onClick={() => move(item.id, -1)} className={buttonClass}>
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`Descendre ${itemLabel}`}
              disabled={index === ordered.length - 1}
              onClick={() => move(item.id, 1)}
              className={buttonClass}
            >
              <ArrowDown className="size-4" />
            </button>
          </div>
        );
        return (
          <div
            key={item.id}
            data-sortable-item
            // Une liste imbriquée n'écoute que ses propres glissés : dragId est local à chaque liste.
            onDragOver={(e) => {
              if (dragId !== null) e.preventDefault();
            }}
            onDrop={(e) => {
              if (dragId === null) return;
              e.preventDefault();
              e.stopPropagation();
              dropOn(item.id);
              setDragId(null);
            }}
            className={cn(dragId === item.id && "opacity-40")}
          >
            {renderItem(item, controls, index)}
          </div>
        );
      })}
    </div>
  );
}
