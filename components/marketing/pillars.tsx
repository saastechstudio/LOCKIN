import { Target, BrainCircuit, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PILLARS = [
  {
    icon: Target,
    title: "Tracking d'OKRs",
    description:
      "Fixez des objectifs mesurables, suivez votre progression jour après jour et gardez le cap sur ce qui compte vraiment.",
  },
  {
    icon: BrainCircuit,
    title: "Coach IA d'excellence 24/7",
    description:
      "Un mentor exigeant et bienveillant, disponible à tout moment pour challenger vos blocages et structurer votre exécution.",
  },
  {
    icon: Users,
    title: "Réseau & Entraide",
    description:
      "Rejoignez un annuaire de membres triés sur le volet, filtrable par secteur et compétences, pour créer les bonnes connexions.",
  },
];

export function Pillars() {
  return (
    <section id="pillars" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
            Trois piliers, une seule quête
          </h2>
          <p className="mt-4 text-muted-foreground">
            Lock In réunit tout ce dont un entrepreneur d&apos;excellence a
            besoin pour progresser avec méthode.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title} className="glass">
              <CardHeader>
                <div className="mb-2 flex size-11 items-center justify-center rounded-lg border border-gold/25 bg-gold/10">
                  <pillar.icon className="size-5 text-gold" />
                </div>
                <CardTitle className="font-serif text-xl">
                  {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {pillar.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
