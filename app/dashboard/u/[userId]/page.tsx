import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { getSocialProfile } from "@/lib/actions/social-profile";
import { ProfileView } from "@/components/social/profile-view";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireLockinOnboarded();
  const { userId } = await params;
  const id = Number(userId);
  if (!Number.isInteger(id)) notFound();

  const data = await getSocialProfile(id);
  if (!data) notFound();

  return (
    <div className="camp-scope">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">
            Lockin Social Club · Profil
          </p>
          {!data.viewerIsOwner ? (
            <Link
              href={`/dashboard/messages/${id}`}
              className="inline-flex items-center gap-1.5 border border-lk-line px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-camp-charcoal uppercase hover:bg-camp-charcoal hover:text-camp-white"
            >
              <MessageSquare className="size-3.5" /> Message
            </Link>
          ) : null}
        </div>
        <ProfileView profile={data.profile} goals={data.goals} routine={data.routine} />
      </div>
    </div>
  );
}
