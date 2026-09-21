"use client";

import { useState, useTransition } from "react";
import { Trash2, Check } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateOkrProgress, deleteOkr } from "@/lib/actions/okrs";
import type { Okr } from "@/lib/db/schema";

export function OkrCard({ okr }: { okr: Okr }) {
  const target = Number(okr.targetValue);
  const current = Number(okr.currentValue);
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const [value, setValue] = useState(current.toString());
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    startTransition(async () => {
      await updateOkrProgress(okr.id, parsed);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteOkr(okr.id);
    });
  };

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="secondary" className="mb-2">
              {okr.category}
            </Badge>
            <h3 className="font-medium text-foreground">{okr.title}</h3>
            {okr.description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {okr.description}
              </p>
            )}
          </div>
          <button
            onClick={handleDelete}
            aria-label="Supprimer l'objectif"
            className="text-muted-foreground/50 transition-colors hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {current} / {target} {okr.unit}
          </span>
          <span className="text-gold-soft">{percent}%</span>
        </div>
        <Progress value={percent} />

        {okr.status === "completed" ? (
          <p className="flex items-center gap-1.5 text-xs text-gold">
            <Check className="size-3.5" /> Objectif atteint
          </p>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-8 text-sm"
              step="any"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={isPending}
            >
              Mettre à jour
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
