"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { updateAiCoachSettings } from "@/lib/actions/ai-coach-settings";
import type { User } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Appearance = User["aiCoachAppearance"];
type Tone = User["aiCoachTone"];
type VisualStyle = User["aiCoachVisualStyle"];

const APPEARANCE_OPTIONS: { id: Appearance; label: string }[] = [
  { id: "masculin", label: "Masculin" },
  { id: "feminin", label: "Féminin" },
  { id: "neutre", label: "Neutre" },
  { id: "minimaliste", label: "Minimaliste" },
];

const TONE_OPTIONS: { id: Tone; label: string; description: string }[] = [
  {
    id: "bienveillant",
    label: "Bienveillant",
    description: "Exigeant sur le fond, chaleureux dans la forme.",
  },
  {
    id: "exigeant",
    label: "Exigeant",
    description: "Direct, sans détour, il ne laisse rien passer.",
  },
  {
    id: "scientifique",
    label: "Scientifique",
    description: "Rigoureux, factuel, argumenté par la donnée.",
  },
  {
    id: "creatif",
    label: "Créatif",
    description: "Angles originaux, reformulations inattendues.",
  },
  {
    id: "founder_mode",
    label: "Founder Mode",
    description: "Style Y Combinator — vitesse, zéro langue de bois.",
  },
];

const VISUAL_STYLE_OPTIONS: { id: VisualStyle; label: string }[] = [
  { id: "friendly_silicon_valley", label: "Friendly Silicon Valley" },
  { id: "premium_minimaliste", label: "Premium Minimaliste" },
  { id: "dark_mode_founder", label: "Dark Mode Founder" },
  { id: "gradient_mode", label: "Gradient Mode" },
  { id: "ultra_minimal", label: "Ultra Minimal" },
];

function OptionCard({
  selected,
  onSelect,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-all duration-150 ease-out",
        selected
          ? "border-brand-blue bg-brand-blue/5 shadow-soft"
          : "border-border bg-brand-card hover:border-brand-blue/40",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {selected && <Check className="size-4 text-brand-blue" />}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </button>
  );
}

export function AiCoachConfigurator({ user }: { user: User }) {
  const [appearance, setAppearance] = useState<Appearance>(user.aiCoachAppearance);
  const [tone, setTone] = useState<Tone>(user.aiCoachTone);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(user.aiCoachVisualStyle);
  const [name, setName] = useState(user.aiCoachName ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const toneLabel = TONE_OPTIONS.find((t) => t.id === tone)?.label ?? tone;
  const appearanceLabel =
    APPEARANCE_OPTIONS.find((a) => a.id === appearance)?.label ?? appearance;
  const visualStyleLabel =
    VISUAL_STYLE_OPTIONS.find((v) => v.id === visualStyle)?.label ?? visualStyle;

  function handleSave() {
    const formData = new FormData();
    formData.set("aiCoachName", name);
    formData.set("aiCoachTone", tone);
    formData.set("aiCoachAppearance", appearance);
    formData.set("aiCoachVisualStyle", visualStyle);

    setSaved(false);
    startTransition(async () => {
      await updateAiCoachSettings(formData);
      setSaved(true);
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-display text-lg text-foreground">
          1. Apparence
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {APPEARANCE_OPTIONS.map((option) => (
            <OptionCard
              key={option.id}
              title={option.label}
              selected={appearance === option.id}
              onSelect={() => setAppearance(option.id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-foreground">
          2. Genre / ton
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TONE_OPTIONS.map((option) => (
            <OptionCard
              key={option.id}
              title={option.label}
              description={option.description}
              selected={tone === option.id}
              onSelect={() => setTone(option.id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-foreground">3. Nom</h2>
        <div className="max-w-sm space-y-1.5">
          <Label htmlFor="aiCoachName">Comment veux-tu l&apos;appeler ?</Label>
          <Input
            id="aiCoachName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nova, Atlas, Mira..."
            maxLength={24}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-foreground">
          4. Style visuel
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VISUAL_STYLE_OPTIONS.map((option) => (
            <OptionCard
              key={option.id}
              title={option.label}
              selected={visualStyle === option.id}
              onSelect={() => setVisualStyle(option.id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-foreground">5. Résumé</h2>
        <Card className="surface">
          <CardHeader>
            <CardTitle className="text-base">
              {name || "Ton Coach IA"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              Apparence : <span className="text-foreground">{appearanceLabel}</span>
            </p>
            <p>
              Ton : <span className="text-foreground">{toneLabel}</span>
            </p>
            <p>
              Nom : <span className="text-foreground">{name || "Non défini"}</span>
            </p>
            <p>
              Style visuel :{" "}
              <span className="text-foreground">{visualStyleLabel}</span>
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending} size="lg">
          {isPending ? "Enregistrement..." : "Sauvegarder mon Coach IA"}
        </Button>
        {saved && !isPending && (
          <span className="text-sm text-brand-blue-deep">Enregistré ✓</span>
        )}
      </div>
    </div>
  );
}
