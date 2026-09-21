import {
  LayoutDashboard,
  BrainCircuit,
  CalendarCheck,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/coach", label: "Coach IA", icon: BrainCircuit },
  { href: "/dashboard/planning", label: "Planning", icon: CalendarCheck },
  { href: "/dashboard/network", label: "Réseau", icon: Users },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];
