import {
  Gauge,
  Repeat,
  Sparkles,
  Briefcase,
  Building2,
  ChartColumn,
  GraduationCap,
  CalendarCheck,
  LifeBuoy,
  MessageSquare,
  Network,
  Plane,
  Rows3,
  Settings,
  SquareUser,
  Swords,
  BookOpen,
  Target,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

/**
 * Navigation de l'espace membre. Le Life OS d'abord (le cockpit, les
 * systèmes de vie, le copilote), puis le club et le réseau, au second plan.
 */
export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: "Life OS",
    items: [
      { href: "/dashboard", label: "Cockpit", icon: Gauge },
      { href: "/dashboard/objectifs", label: "Objectifs", icon: Target },
      { href: "/dashboard/habitudes", label: "Habitudes", icon: Repeat },
      { href: "/dashboard/coach", label: "Copilote", icon: Sparkles },
      { href: "/dashboard/planning", label: "Planning", icon: CalendarCheck },
      { href: "/dashboard/progression", label: "Progression", icon: ChartColumn },
    ],
  },
  {
    label: "Club",
    items: [
      { href: "/dashboard/feed", label: "Feed", icon: Rows3 },
      { href: "/dashboard/groupes", label: "Clubs", icon: Building2 },
      { href: "/dashboard/entraide", label: "Entraide", icon: LifeBuoy },
      { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
      { href: "/dashboard/challenges", label: "Challenges", icon: Swords },
      { href: "/formations", label: "Formations", icon: BookOpen },
    ],
  },
  {
    label: "Réseau",
    items: [
      { href: "/dashboard/mentors", label: "Mentors", icon: GraduationCap },
      { href: "/dashboard/business", label: "Business", icon: Briefcase },
      { href: "/dashboard/network", label: "Réseau", icon: Network },
      { href: "/lockintrip", label: "Lockin Trip", icon: Plane },
    ],
  },
  {
    label: "Compte",
    items: [
      { href: "/dashboard/profil", label: "Profil", icon: SquareUser },
      { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

export const DASHBOARD_NAV: DashboardNavItem[] = DASHBOARD_NAV_GROUPS.flatMap((g) => g.items);

/** Barre d'onglets mobile : les cinq écrans du quotidien, le club en dernier. */
export const DASHBOARD_TABS: DashboardNavItem[] = [
  { href: "/dashboard", label: "Cockpit", icon: Gauge },
  { href: "/dashboard/objectifs", label: "Objectifs", icon: Target },
  { href: "/dashboard/habitudes", label: "Habitudes", icon: Repeat },
  { href: "/dashboard/coach", label: "Copilote", icon: Sparkles },
  { href: "/dashboard/feed", label: "Club", icon: Rows3 },
];

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}
