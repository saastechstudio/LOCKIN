"use client";

import { useMemo, useState } from "react";
import { Search, Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export type NetworkMember = {
  id: number;
  name: string | null;
  avatarUrl: string | null;
  email: string;
  sector: string | null;
  skills: string | null;
  bio: string | null;
};

function initials(name: string | null) {
  if (!name) return "LI";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NetworkDirectory({ members }: { members: NetworkMember[] }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");

  const sectors = useMemo(() => {
    const set = new Set(members.map((m) => m.sector).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [members]);

  const filtered = members.filter((m) => {
    const matchesSector = sector === "all" || m.sector === sector;
    const haystack = `${m.name ?? ""} ${m.skills ?? ""} ${m.bio ?? ""}`.toLowerCase();
    const matchesQuery = query.trim() === "" || haystack.includes(query.toLowerCase());
    return matchesSector && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un membre, une compétence..."
            className="pl-9"
          />
        </div>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Secteur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les secteurs</SelectItem>
            {sectors.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Aucun membre ne correspond à cette recherche.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <Card key={member.id} className="glass">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11">
                    <AvatarImage src={member.avatarUrl ?? undefined} />
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {member.name ?? "Membre Lock In"}
                    </p>
                    {member.sector && (
                      <Badge variant="secondary" className="mt-1">
                        {member.sector}
                      </Badge>
                    )}
                  </div>
                </div>

                {member.bio && (
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                    {member.bio}
                  </p>
                )}

                {member.skills && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {member.skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                  </div>
                )}

                <a
                  href={`mailto:${member.email}`}
                  className="mt-4 flex items-center gap-1.5 text-xs text-brand-prune transition-colors hover:text-brand-prune-soft"
                >
                  <Mail className="size-3.5" /> Contacter
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
