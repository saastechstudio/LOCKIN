import { cn } from "@/lib/utils";

type Person = { id: number; name: string | null; avatarUrl: string | null };

/** Pastille de membre : photo, sinon initiale sur fond vert nuit. */
export function PersonAvatar({ person, size = "md", className }: { person: Person; size?: "sm" | "md" | "lg"; className?: string }) {
  const dim = { sm: "size-7 text-[11px]", md: "size-10 text-sm", lg: "size-12 text-base" }[size];
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-lk-mist font-medium text-lk-black",
        dim,
        className,
      )}
    >
      {person.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- photo hébergée par Clerk, cf. components/ui/avatar.tsx
        <img src={person.avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        (person.name ?? "?").charAt(0).toUpperCase()
      )}
    </span>
  );
}

/** Jusqu'à trois membres qui se chevauchent : l'avatar d'un groupe ou d'un salon. */
export function AvatarStack({ people, className }: { people: Person[]; className?: string }) {
  const shown = people.slice(0, 3);
  if (shown.length <= 1) return <PersonAvatar person={shown[0] ?? { id: 0, name: "?", avatarUrl: null }} className={className} />;
  return (
    <span className={cn("relative flex size-10 shrink-0", className)}>
      {shown.map((p, i) => (
        <PersonAvatar
          key={p.id}
          person={p}
          size="sm"
          className={cn("absolute ring-2 ring-[#0b2210]", i === 0 && "top-0 left-0", i === 1 && "right-0 bottom-0", i === 2 && "top-0 right-0 z-10")}
        />
      ))}
    </span>
  );
}
