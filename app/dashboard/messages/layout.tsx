import { requireLockinOnboarded } from "@/lib/auth";
import { listInbox } from "@/lib/channel/queries";
import { ChannelShell } from "@/components/channel/channel-shell";

export const dynamic = "force-dynamic";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const user = await requireLockinOnboarded();
  const inbox = await listInbox(user.id);
  return (
    <ChannelShell initialInbox={inbox} meId={user.id}>
      {children}
    </ChannelShell>
  );
}
