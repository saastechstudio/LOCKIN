"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOkr } from "@/lib/actions/okrs";

const CATEGORIES = ["CA", "Produit", "Mindset", "Réseau", "Croissance", "Autre"];

export function NewOkrDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createOkr(formData);
      formRef.current?.reset();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> Nouvel objectif
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel objectif</DialogTitle>
          <DialogDescription>
            Fixez un objectif mesurable et daté pour rester verrouillé sur
            l&apos;exécution.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" name="title" required placeholder="Atteindre 50k€ de CA mensuel" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Catégorie</Label>
              <Select name="category" defaultValue={CATEGORIES[0]}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unit">Unité</Label>
              <Input id="unit" name="unit" required placeholder="€, clients, %..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="targetValue">Valeur cible</Label>
              <Input
                id="targetValue"
                name="targetValue"
                type="number"
                step="any"
                required
                placeholder="50000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Échéance</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Création..." : "Créer l'objectif"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
