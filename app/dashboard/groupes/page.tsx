import Link from "next/link";

import { requireLockinOnboarded } from "@/lib/auth";
import { getGroups } from "@/lib/actions/groups";
import { GROUP_TYPE_LABELS } from "@/lib/social/data";
import type { GroupSeed } from "@/lib/social/data";

export const dynamic = "force-dynamic";

export default async function GroupesPage() {
  await requireLockinOnboarded();
  const groups = await getGroups();

  const sections = (Object.keys(GROUP_TYPE_LABELS) as GroupSeed["type"][]).map((type) => ({
    type,
    label: GROUP_TYPE_LABELS[type],
    items: groups.filter((g) => g.type === type),
  }));

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] border border-camp-hairline p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
          Lockin Social Club
        </p>
        <h1 className="font-display mb-8 text-2xl font-bold text-camp-charcoal uppercase">
          Groupes
        </h1>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.type}>
              <p className="mb-3 font-mono text-[11px] font-bold tracking-[0.15em] text-camp-charcoal/50 uppercase">
                {section.label}
              </p>
              <div className="border-t border-l border-camp-hairline sm:grid sm:grid-cols-2">
                {section.items.map((group) => (
                  <Link
                    key={group.id}
                    href={`/dashboard/groupes/${group.slug}`}
                    className="flex items-center justify-between gap-3 border-r border-b border-camp-hairline px-4 py-3 hover:bg-camp-cream"
                  >
                    <span className="text-sm font-medium text-camp-charcoal">{group.name}</span>
                    <span className="font-mono text-[11px] text-camp-charcoal/40">
                      {group.memberCount} membre{group.memberCount > 1 ? "s" : ""}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
