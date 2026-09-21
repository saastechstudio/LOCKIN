import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/auth";
import { NetworkDirectory } from "@/components/dashboard/network-directory";

export default async function NetworkPage() {
  const user = await getOrCreateDbUser();

  const members = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      avatarUrl: true,
      email: true,
      sector: true,
      skills: true,
      bio: true,
    },
  });

  const otherMembers = members.filter((m) => m.id !== user.id);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-foreground">Réseau & Entraide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {otherMembers.length} membre{otherMembers.length > 1 ? "s" : ""} du
          club. Filtrez par secteur ou compétences pour créer les bonnes
          connexions.
        </p>
      </div>
      <NetworkDirectory members={otherMembers} />
    </div>
  );
}
