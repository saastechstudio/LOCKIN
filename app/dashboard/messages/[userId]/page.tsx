import { notFound } from "next/navigation";

import { requireLockinOnboarded } from "@/lib/auth";
import { DirectRedirect } from "@/components/channel/direct-redirect";

export const dynamic = "force-dynamic";

/** Compatibilité : les liens « Écrire » des profils pointent encore ici. */
export default async function DirectLinkPage({ params }: { params: Promise<{ userId: string }> }) {
  await requireLockinOnboarded();
  const { userId } = await params;
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <DirectRedirect userId={id} />;
}
