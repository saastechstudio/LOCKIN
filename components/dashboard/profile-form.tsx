"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/lib/actions/profile";
import type { User } from "@/lib/db/schema";

export function ProfileForm({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateProfile(formData);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="sector">Secteur d&apos;activité</Label>
        <Input
          id="sector"
          name="sector"
          defaultValue={user.sector ?? ""}
          placeholder="SaaS, E-commerce, Conseil..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
        <Input
          id="skills"
          name="skills"
          defaultValue={user.skills ?? ""}
          placeholder="Growth, Vente, Product, Levée de fonds..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={user.bio ?? ""}
          placeholder="Présentez-vous en quelques mots aux autres membres..."
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer le profil"}
      </Button>
    </form>
  );
}
