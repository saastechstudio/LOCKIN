"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flame,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AuditResult } from "@/lib/ai/audit";
import { GlossaryTerm } from "@/components/ui/glossary-term";
import { GLOSSARY } from "@/lib/glossary";

const REVENUE_LEVELS = [
  "Pas encore de revenus",
  "Moins de 1 000 €/mois",
  "De 1 000 à 5 000 €/mois",
  "De 5 000 à 20 000 €/mois",
  "De 20 000 à 50 000 €/mois",
  "Plus de 50 000 €/mois",
];

type Step = 1 | 2 | 3;

type FormState = {
  motivations: string;
  psychologicalBlockers: string;
  currentRoutine: string;
  disciplineLevel: number;
  sector: string;
  revenueLevel: string;
  businessGoals: string;
  majorGoal: string;
  durationMonths: number;
};

const INITIAL_STATE: FormState = {
  motivations: "",
  psychologicalBlockers: "",
  currentRoutine: "",
  disciplineLevel: 5,
  sector: "",
  revenueLevel: "",
  businessGoals: "",
  majorGoal: "",
  durationMonths: 6,
};

export function AuditFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const step1Valid =
    form.motivations.trim().length > 0 &&
    form.psychologicalBlockers.trim().length > 0 &&
    form.currentRoutine.trim().length > 0;
  const step2Valid =
    form.sector.trim().length > 0 &&
    form.revenueLevel.length > 0 &&
    form.businessGoals.trim().length > 0;
  const step3Valid = form.majorGoal.trim().length > 0;

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);
    try {
      const res = await fetch("/api/audit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "La génération du programme a échoué.");
      }
      const data: AuditResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsGenerating(false);
    }
  }

  if (result) {
    return <AuditResultView result={result} onContinue={() => router.push("/dashboard")} />;
  }

  const progressValue = isGenerating ? 90 : ((step - 1) / 3) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/25 bg-brand-blue/5 px-4 py-1.5 text-xs tracking-[0.2em] text-brand-blue-deep uppercase">
          Audit d&apos;entrée
        </span>
        <h1 className="font-display text-3xl text-foreground">
          Construisons ton programme Lock In
        </h1>
        <p className="text-sm text-muted-foreground">
          3 étapes pour identifier ton frein principal et générer ta feuille de route.
        </p>
      </div>

      <div className="space-y-1.5">
        <Progress value={progressValue} />
        <p className="text-right text-xs text-muted-foreground">
          Étape {step} / 3
        </p>
      </div>

      <Card className="surface">
        <CardHeader>
          <CardTitle className="font-display text-xl">
            {step === 1 && "Profil personnel"}
            {step === 2 && "Profil professionnel"}
            {step === 3 && "Projet & horizon temporel"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="motivations">
                  Pourquoi veux-tu réussir ? Quelles sont tes motivations profondes ?
                </Label>
                <Textarea
                  id="motivations"
                  rows={3}
                  placeholder="Liberté financière, prouver quelque chose, protéger tes proches, laisser une trace..."
                  value={form.motivations}
                  onChange={(e) => set("motivations", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="psychologicalBlockers">
                  Quels sont tes principaux freins psychologiques ?
                </Label>
                <Textarea
                  id="psychologicalBlockers"
                  rows={3}
                  placeholder="Procrastination, peur de l'échec, syndrome de l'imposteur..."
                  value={form.psychologicalBlockers}
                  onChange={(e) => set("psychologicalBlockers", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currentRoutine">Décris ta routine actuelle</Label>
                <Textarea
                  id="currentRoutine"
                  rows={3}
                  placeholder="Ton quotidien type : rythme de travail, sommeil, sport..."
                  value={form.currentRoutine}
                  onChange={(e) => set("currentRoutine", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Niveau de discipline</Label>
                  <span className="font-display text-lg text-brand-coral">
                    {form.disciplineLevel}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={form.disciplineLevel}
                  onChange={(e) => set("disciplineLevel", Number(e.target.value))}
                  className="w-full accent-[var(--brand-coral)]"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="sector">Secteur d&apos;activité</Label>
                <Input
                  id="sector"
                  placeholder="SaaS, e-commerce, conseil, immobilier..."
                  value={form.sector}
                  onChange={(e) => set("sector", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="revenueLevel">Niveau de revenus / CA actuel</Label>
                <Select
                  value={form.revenueLevel}
                  onValueChange={(v) => set("revenueLevel", v)}
                >
                  <SelectTrigger id="revenueLevel" className="w-full">
                    <SelectValue placeholder="Sélectionne une tranche" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVENUE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="businessGoals">Objectifs professionnels</Label>
                <Textarea
                  id="businessGoals"
                  rows={3}
                  placeholder="Ce que tu cherches à atteindre professionnellement..."
                  value={form.businessGoals}
                  onChange={(e) => set("businessGoals", e.target.value)}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="majorGoal">Objectif majeur</Label>
                <Textarea
                  id="majorGoal"
                  rows={2}
                  placeholder="Le projet ou objectif principal que tu veux verrouiller..."
                  value={form.majorGoal}
                  onChange={(e) => set("majorGoal", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Durée cible</Label>
                  <span className="font-display text-lg text-brand-blue">
                    {form.durationMonths} mois
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={36}
                  step={1}
                  value={form.durationMonths}
                  onChange={(e) => set("durationMonths", Number(e.target.value))}
                  className="w-full accent-[var(--brand-blue)]"
                />
                <p className="text-xs text-muted-foreground">
                  Durée recommandée : 6 mois (Plage possible : 3 à 36 mois selon la
                  complexité du projet).
                </p>
              </div>
            </>
          )}

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => (s - 1) as Step)}
                disabled={isGenerating}
              >
                <ArrowLeft className="size-4" /> Précédent
              </Button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
              >
                Suivant <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={!step3Valid || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" /> Générer mon programme
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuditResultView({
  result,
  onContinue,
}: {
  result: AuditResult;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/25 bg-brand-blue/5 px-4 py-1.5 text-xs tracking-[0.2em] text-brand-blue-deep uppercase">
          Ton programme Lock In
        </span>
        <h1 className="font-display text-3xl text-foreground">
          Feuille de route générée
        </h1>
      </div>

      <Card className="border-brand-blue/30 bg-brand-blue/5">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Lock className="size-4 text-brand-blue" />
          <CardTitle className="font-display text-lg">
            <GlossaryTerm definition={GLOSSARY.freinLockIn}>
              Ton Frein Lock In
            </GlossaryTerm>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">{result.lockInBlocker}</p>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Flame className="size-4 text-brand-coral" />
          <CardTitle className="font-display text-lg">Feuille de route</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-5">
            {result.roadmap.map((phase, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-brand-coral/40 bg-brand-coral/10 font-display text-sm text-brand-coral">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-medium text-foreground">{phase.phase}</p>
                    <span className="text-xs text-muted-foreground">
                      {phase.durationWeeks} sem.
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{phase.focus}</p>
                  {phase.objective && (
                    <p className="mt-2 text-sm font-medium text-foreground">
                      🎯 {phase.objective}
                    </p>
                  )}
                  {phase.steps && phase.steps.length > 0 && (
                    <div className="mt-2 space-y-3 border-l-2 border-brand-coral/30 pl-3">
                      {phase.steps.map((step, j) => (
                        <div key={j}>
                          <p className="text-sm font-medium text-foreground">
                            {step.title}
                          </p>
                          <ul className="mt-1 space-y-1">
                            {step.actions.map((action, k) => (
                              <li
                                key={k}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-blue" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  {phase.milestone && (
                    <p className="mt-2 text-xs text-brand-coral">
                      Jalon : {phase.milestone}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Actions prioritaires de la semaine 1
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {result.firstWeekActions.map((action, i) => (
              <li key={i} className={cn("flex items-start gap-2.5 text-sm text-foreground")}>
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-blue" />
                {action}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button onClick={onContinue} size="lg" className="w-full">
        Accéder à mon dashboard <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
