import {
  AreaChart,
  ScanLine,
  MapPin,
  Hash,
  LayoutDashboard,
  ListChecks,
  Users,
  Package,
  BarChartHorizontal,
  History,
} from "lucide-react";

export type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: Array<"admin" | "user">;
  isReport?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel", roles: ["admin", "user"] },
  { href: "/ean", icon: ScanLine, label: "Escanear EAN", roles: ["admin", "user"] },
  { href: "/serials", icon: Hash, label: "Escanear Series", roles: ["admin", "user"] },
  { href: "/zones", icon: MapPin, label: "Zonas", roles: ["admin", "user"] },
  { href: "/articles", icon: Package, label: "Maestro de Artículos", roles: ["admin", "user"] },
  { href: "/scans", icon: History, label: "Historial de Escaneos", roles: ["admin", "user"] },
  { href: "/report", icon: ListChecks, label: "Informe de Conteos", roles: ["admin", "user"], isReport: true },
  { href: "/sku-summary", icon: Package, label: "Resumen por SKU", roles: ["admin", "user"], isReport: true },
  { href: "/zone-summary", icon: BarChartHorizontal, label: "Resumen por Zona", roles: ["admin", "user"], isReport: true },
  { href: "/users", icon: Users, label: "Usuarios", roles: ["admin"] },
];
