import { requireLockinOnboarded } from "@/lib/auth";
import { getSocialProfile } from "@/lib/actions/social-profile";
import { OwnProfile } from "@/components/social/own-profile";

export const dynamic = "force-dynamic";

export default async function OwnProfilePage() {
  const user = await requireLockinOnboarded();
  const data = await getSocialProfile(user.id);
  if (!data) return null;

  return (
    <div className="camp-scope">
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">
          Lockin Social Club · Mon profil
        </p>
        <OwnProfile profile={data.profile} goals={data.goals} routine={data.routine} />
      </div>
    </div>
  );
}
