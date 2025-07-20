"use server";

import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Truck, ScanLine, MapPin, List, Hash, LayoutDashboard, ListChecks, Users, Package, BarChartHorizontal, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions";
import { Button } from "../ui/button";
import type { AuthenticatedUser } from "@/lib/session";
import { headers } from "next/headers";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel", roles: ['admin', 'user'] },
  { href: "/ean", icon: ScanLine, label: "Escanear EAN", roles: ['admin', 'user'] },
  { href: "/serials", icon: Hash, label: "Escanear Series", roles: ['admin', 'user'] },
  { href: "/zones", icon: MapPin, label: "Zonas", roles: ['admin', 'user'] },
  { href: "/articles", icon: List, label: "Artículos", roles: ['admin', 'user'] },
  { href: "/report", icon: ListChecks, label: "Informe de Conteos", roles: ['admin', 'user'] },
  { href: "/sku-summary", icon: Package, label: "Resumen por SKU", roles: ['admin', 'user'] },
  { href: "/zone-summary", icon: BarChartHorizontal, label: "Resumen por Zona", roles: ['admin', 'user'] },
  { href: "/users", icon: Users, label: "Usuarios", roles: ['admin'] },
];

export default async function Sidebar({ user }: { user: AuthenticatedUser }) {
  const pathname = headers().get('next-url') || '';
  
  const userRole = user?.role || 'user';
  const accessibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Truck className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">ZoneScan</span>
          </Link>

          {accessibleNavItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname.startsWith(item.href) && item.href !== "/dashboard" ? "bg-accent text-accent-foreground" : pathname === item.href ? "bg-accent text-accent-foreground" : ""
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <form action={logout}>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Cerrar Sesión</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Cerrar Sesión</TooltipContent>
                </Tooltip>
            </form>
        </div>
      </TooltipProvider>
    </aside>
  );
}