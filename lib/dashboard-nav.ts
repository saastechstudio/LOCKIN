import {
  BrainCircuit,
  Briefcase,
  Building2,
  ChartColumn,
  GraduationCap,
  CalendarCheck,
  LayoutGrid,
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
 * Navigation de l'espace membre, rangée par usage : le club (la
 * communauté), la discipline (soi), les outils, le compte. Icônes lucide
 * aux formes carrées, rendues en trait fin à angles vifs (globals.css).
 */
export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: "Club",
    items: [
      { href: "/dashboard", label: "Accueil", icon: LayoutGrid },
      { href: "/dashboard/feed", label: "Feed", icon: Rows3 },
      { href: "/dashboard/groupes", label: "Clubs", icon: Building2 },
      { href: "/dashboard/entraide", label: "Entraide", icon: LifeBuoy },
      { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    label: "Discipline",
    items: [
      { href: "/dashboard/objectifs", label: "Objectifs & routines", icon: Target },
      { href: "/dashboard/progression", label: "Progression", icon: ChartColumn },
      { href: "/dashboard/challenges", label: "Challenges", icon: Swords },
      { href: "/formations", label: "Formations", icon: BookOpen },
      { href: "/dashboard/planning", label: "Planning", icon: CalendarCheck },
      { href: "/dashboard/coach", label: "Coach IA", icon: BrainCircuit },
    ],
  },
  {
    label: "Réseau",
    items: [
      { href: "/dashboard/mentors", label: "Mentors", icon: GraduationCap },
      { href: "/dashboard/business", label: "Business", icon: Briefcase },
      { href: "/dashboard/network", label: "Réseau", icon: Network },
      { href: "/camp", label: "Lock-In Camp", icon: Plane },
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

/** Barre d'onglets mobile : les cinq écrans du quotidien. */
export const DASHBOARD_TABS: DashboardNavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: LayoutGrid },
  { href: "/dashboard/feed", label: "Feed", icon: Rows3 },
  { href: "/dashboard/objectifs", label: "Objectifs", icon: Target },
  { href: "/dashboard/entraide", label: "Entraide", icon: LifeBuoy },
  { href: "/dashboard/profil", label: "Profil", icon: SquareUser },
];

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}
