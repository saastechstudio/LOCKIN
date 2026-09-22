import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Indicator = {
  label: string;
  value: number;
};

export function EnergyWidget({
  energy,
  discipline,
  motivation,
}: {
  energy: number;
  discipline: number;
  motivation: number;
}) {
  const indicators: Indicator[] = [
    { label: "Énergie", value: energy },
    { label: "Discipline", value: discipline },
    { label: "Motivation", value: motivation },
  ];

  return (
    <Card className="surface">
      <CardHeader>
        <CardTitle className="font-display text-xl">
          Énergie &amp; Performance
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Basé sur tes 7 derniers jours de bilan et de priorité quotidienne.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {indicators.map((indicator) => (
          <div key={indicator.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground">{indicator.label}</span>
              <span className="text-muted-foreground">{indicator.value}%</span>
            </div>
            <Progress value={indicator.value} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
