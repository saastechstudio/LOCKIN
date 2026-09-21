"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SESSION_KEY = "lockin-exit-intent-shown";
const ARM_DELAY_MS = 4000;

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const armed = useRef(false);

  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage unavailable (private browsing) — degrade to "never show".
      alreadyShown = true;
    }
    if (alreadyShown) return;

    const armTimer = setTimeout(() => {
      armed.current = true;
    }, ARM_DELAY_MS);

    function handleMouseLeave(e: MouseEvent) {
      if (!armed.current || e.clientY > 0) return;
      setOpen(true);
      armed.current = false;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader className="items-center text-center">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-coral/25 bg-brand-blue/5 px-3 py-1 text-[10px] tracking-[0.2em] text-brand-coral uppercase">
            <Flame className="size-3" />
            Avant de partir
          </span>
          <DialogTitle className="text-2xl">
            L&apos;excellence n&apos;attend pas.
          </DialogTitle>
          <DialogDescription>
            Rejoins le Club Lock In et teste 14 jours gratuitement : Coach IA,
            audit personnalisé et suivi quotidien. Sans engagement.
          </DialogDescription>
        </DialogHeader>

        <Button asChild size="lg" className="w-full" onClick={() => setOpen(false)}>
          <Link href="/sign-up">
            Démarrer mon essai gratuit <ArrowRight className="size-4" />
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
