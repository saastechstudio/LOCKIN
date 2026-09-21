"use client";

import { useRef, useState, useTransition } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createCheckin } from "@/lib/actions/checkins";

export function CheckinForm() {
  const [rating, setRating] = useState(3);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    formData.set("rating", rating.toString());
    startTransition(async () => {
      await createCheckin(formData);
      formRef.current?.reset();
      setRating(3);
      setDone(true);
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Comment évalues-tu ta journée ?</Label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} sur 5`}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  n <= rating
                    ? "fill-brand-blue text-brand-blue"
                    : "text-muted-foreground/30",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wins">Victoires du jour</Label>
        <Textarea id="wins" name="wins" rows={2} placeholder="Ce qui a bien fonctionné..." />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bottlenecks">Blocages</Label>
        <Textarea
          id="bottlenecks"
          name="bottlenecks"
          rows={2}
          placeholder="Ce qui a freiné..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="focusOfTomorrow">Focus de demain</Label>
        <Textarea
          id="focusOfTomorrow"
          name="focusOfTomorrow"
          rows={2}
          placeholder="La priorité absolue de demain..."
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Enregistrement..." : "Valider le check-in"}
      </Button>

      {done && !isPending && (
        <p className="text-center text-xs text-brand-blue-deep">
          Check-in enregistré. À demain, verrouillé.
        </p>
      )}
    </form>
  );
}
