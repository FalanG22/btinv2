
"use server";

import Link from "next/link";
import { PanelLeft, Truck, LogOut, AreaChart, ChevronDown, ScanLine, MapPin, Hash, LayoutDashboard, ListChecks, Users, Package, BarChartHorizontal, History } from "lucide-react";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions";
import type { AuthenticatedUser } from "@/lib/session";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: Array<'admin' | 'user'>;
  isReport?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel", roles: ['admin', 'user'] },
  { href: "/ean", icon: ScanLine, label: "Escanear EAN", roles: ['admin', 'user'] },
  { href: "/serials", icon: Hash, label: "Escanear Series", roles: ['admin', 'user'] },
  { href: "/zones", icon: MapPin, label: "Zonas", roles: ['admin', 'user'] },
  { href: "/articles", icon: Package, label: "Maestro de Artículos", roles: ['admin', 'user'] },
  { href: "/scans", icon: History, label: "Historial de Escaneos", roles: ['admin', 'user']},
  { href: "/report", icon: ListChecks, label: "Informe de Conteos", roles: ['admin', 'user'], isReport: true },
  { href: "/sku-summary", icon: Package, label: "Resumen por SKU", roles: ['admin', 'user'], isReport: true },
  { href: "/zone-summary", icon: BarChartHorizontal, label: "Resumen por Zona", roles: ['admin', 'user'], isReport: true },
  { href: "/users", icon: Users, label: "Usuarios", roles: ['admin'] },
];

export default async function MobileSidebar({ user }: { user: AuthenticatedUser }) {
  const pathname = headers().get("next-url") || "";
  const userRole = user?.role || "user";

  const accessibleNavItems = navItems.filter((item) => item.roles.includes(userRole) && !item.isReport);
  const reportItems = navItems.filter((item) => item.roles.includes(userRole) && item.isReport);
  const hasReportsAccess = reportItems.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Truck className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">ZoneScan</span>
            </Link>
            
            {accessibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                  pathname.startsWith(item.href) && "text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}

            {hasReportsAccess && (
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-2.5 text-muted-foreground hover:text-foreground [&[data-state=open]>svg]:rotate-180">
                   <div className="flex items-center gap-4">
                    <AreaChart className="h-5 w-5" />
                    <span>Reportes</span>
                   </div>
                   <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 grid gap-4 pl-11">
                  {reportItems.map((item) => (
                     <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground",
                        pathname.startsWith(item.href) && "text-foreground font-semibold"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}


            <form action={logout} className="mt-auto">
                <Button variant="ghost" className="w-full justify-start gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                </Button>
            </form>

          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
