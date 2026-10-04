import {
  LayoutDashboard,
  Rss,
  UserRound,
  UsersRound,
  Target,
  BrainCircuit,
  CalendarCheck,
  Users,
  Plane,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Lockin Social Club : Feed ici, puis Profil / Groupes / Objectifs / Entraide
// ajoutés au fil de leurs PR respectives (lib/dashboard-nav.ts reste la
// seule source de vérité pour sidebar + mobile-nav).
export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/feed", label: "Feed", icon: Rss },
  { href: "/dashboard/profil", label: "Profil", icon: UserRound },
  { href: "/dashboard/groupes", label: "Groupes", icon: UsersRound },
  { href: "/dashboard/objectifs", label: "Objectifs", icon: Target },
  { href: "/dashboard/coach", label: "Coach IA", icon: BrainCircuit },
  { href: "/dashboard/planning", label: "Planning", icon: CalendarCheck },
  { href: "/dashboard/network", label: "Réseau", icon: Users },
  { href: "/camp", label: "Lock-In Camp", icon: Plane },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];
