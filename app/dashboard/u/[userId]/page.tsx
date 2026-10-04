import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { getSocialProfile } from "@/lib/actions/social-profile";
import { ProfileView } from "@/components/social/profile-view";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const id = Number(userId);
  if (!Number.isInteger(id)) notFound();

  const data = await getSocialProfile(id);
  if (!data) notFound();

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] border border-camp-hairline p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
            Lockin Social Club · Profil
          </p>
          {!data.viewerIsOwner ? (
            <Link
              href={`/dashboard/messages/${id}`}
              className="inline-flex items-center gap-1.5 border-2 border-camp-charcoal px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-camp-charcoal uppercase hover:bg-camp-charcoal hover:text-camp-white"
            >
              <MessageCircle className="size-3.5" /> Message
            </Link>
          ) : null}
        </div>
        <ProfileView profile={data.profile} goals={data.goals} routine={data.routine} />
      </div>
    </div>
  );
}
