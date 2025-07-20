
"use server";

import Link from "next/link";
import { PanelLeft, Truck, LogOut } from "lucide-react";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions";
import type { AuthenticatedUser } from "@/lib/session";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { navItems } from "./sidebar"; // Reuse navItems from desktop sidebar

export default async function MobileSidebar({ user }: { user: AuthenticatedUser }) {
  const pathname = headers().get("next-url") || "";
  const userRole = user?.role || "user";
  const accessibleNavItems = navItems.filter((item) => item.roles.includes(userRole));

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

            <form action={logout}>
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
