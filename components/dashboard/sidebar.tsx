import { Logo } from "@/components/lockin/logo";
import { SLOGAN_LINE_1, SLOGAN_LINE_2 } from "@/components/lockin/primitives";
import { NavList } from "@/components/dashboard/nav-list";

export function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-lk-line bg-lk-white md:flex">
      <div className="flex h-16 items-center border-b border-lk-line px-6">
        <Logo size="sm" href="/dashboard" />
      </div>

      <NavList />

      <div className="border-t border-lk-line px-6 py-5 text-xs leading-relaxed text-lk-stone-3">
        {SLOGAN_LINE_1}
        <br />
        <span className="font-medium text-lk-black">{SLOGAN_LINE_2}</span>
      </div>
    </aside>
  );
}
