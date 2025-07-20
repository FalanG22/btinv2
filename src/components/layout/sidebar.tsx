
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Truck, ScanLine, MapPin, List, Hash, LayoutDashboard, ListChecks, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// In a real app, you'd get this from a session hook
const userRole = 'admin'; 

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ['admin', 'user'] },
  { href: "/ean", icon: ScanLine, label: "Scan EAN", roles: ['admin', 'user'] },
  { href: "/serials", icon: Hash, label: "Scan Series", roles: ['admin', 'user'] },
  { href: "/zones", icon: MapPin, label: "Zones", roles: ['admin', 'user'] },
  { href: "/articles", icon: List, label: "Articles", roles: ['admin', 'user'] },
  { href: "/report", icon: ListChecks, label: "Counts Report", roles: ['admin', 'user'] },
  { href: "/users", icon: Users, label: "Users", roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();

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
                    pathname === item.href && "bg-accent text-accent-foreground"
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
      </TooltipProvider>
    </aside>
  );
}
