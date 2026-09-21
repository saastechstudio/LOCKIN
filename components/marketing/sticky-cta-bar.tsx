"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StickyCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.9);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`surface fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 px-6 py-3 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <p className="hidden text-sm text-foreground sm:block">
        <span className="font-display text-brand-coral">14 jours d&apos;essai gratuit</span>{" "}
        — dès 9,90&nbsp;€/mois
      </p>
      <Button asChild size="sm" className="w-full sm:w-auto">
        <Link href="/sign-up">
          Rejoindre le Club <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
