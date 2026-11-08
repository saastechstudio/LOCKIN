import { Handshake, Hash, ShieldCheck } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { listOpenRooms, pendingPactInvites } from "@/lib/channel/queries";
import { activePactsOf } from "@/lib/channel/pact-view";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MessagesHubPage() {
  const user = await requireLockinOnboarded();
  const [invites, pacts, rooms] = await Promise.all([pendingPactInvites(user.id), activePactsOf(user.id), listOpenRooms(user.id)]);

  return (
    <div className="h-full overflow-y-auto p-6 sm:p-10">
      <div className="mx-auto max-w-xl">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-lk-blue/25 text-lk-blue-soft">
          <ShieldCheck className="size-7" />
        </span>
        <h2 className="font-display mt-4 text-2xl text-lk-black">Secure Channel™</h2>
        <p className="mt-1 text-sm text-lk-stone-3">
          Échanges privés, groupes, salons thématiques et pactes d&apos;accountability, reliés à tes objectifs et à SphereLife.
        </p>

        {invites.length > 0 ? (
          <section className="mt-8">
            <h3 className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-lk-gold uppercase">Invitations</h3>
            <ul className="space-y-1.5">
              {invites.map((p) => (
                <li key={p.id}>
                  <Link href={`/dashboard/messages/c/${p.conversationId}`} className="lk-glass lk-lift flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-lk-black">
                    <Handshake className="size-4 text-lk-gold" /> {p.initiator.name ?? "Un membre"} te propose un pacte
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {pacts.length > 0 ? (
          <section className="mt-8">
            <h3 className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">Tes pactes</h3>
            <ul className="space-y-1.5">
              {pacts.map((p) => {
                const other = p.initiatorId === user.id ? p.partner : p.initiator;
                return (
                  <li key={p.id}>
                    <Link href={`/dashboard/messages/c/${p.conversationId}`} className="lk-glass lk-lift flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-lk-black">
                      <Handshake className="size-4 text-lk-blue-soft" /> {other.name ?? "Partenaire"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {rooms.length > 0 ? (
          <section className="mt-8">
            <h3 className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">Salons ouverts</h3>
            <ul className="space-y-1.5">
              {rooms.slice(0, 6).map((r) => (
                <li key={r.id} className="lk-glass flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-lk-black">
                  <span>
                    <Hash className="mr-1.5 inline size-3.5 text-lk-blue-soft" />
                    {r.title}
                  </span>
                  <span className="text-xs text-lk-stone-3">
                    {r.topic} · {r.members}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-lk-stone-3">Rejoins un salon depuis le bouton +.</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
