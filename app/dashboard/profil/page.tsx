import { getOrCreateDbUser } from "@/lib/auth";
import { getSocialProfile } from "@/lib/actions/social-profile";
import { OwnProfile } from "@/components/social/own-profile";

export const dynamic = "force-dynamic";

export default async function OwnProfilePage() {
  const user = await getOrCreateDbUser();
  const data = await getSocialProfile(user.id);
  if (!data) return null;

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] border border-camp-hairline p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
          Lockin Social Club · Mon profil
        </p>
        <OwnProfile profile={data.profile} goals={data.goals} routine={data.routine} />
      </div>
    </div>
  );
}
