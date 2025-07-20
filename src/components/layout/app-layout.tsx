"use client";

import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { useEffect, useState } from 'react';
import type { AuthenticatedUser } from '@/lib/session';

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    // We need to fetch the user on the client side for a dynamic sidebar
    // This avoids issues with server/client state mismatch after login
    getCurrentUser().then(setUser);
  }, [pathname]); // Re-fetch on path change to ensure role is up-to-date


  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  // While fetching the user, you can show a loader or a skeleton layout
  if (!user) {
    return (
        <div className="flex min-h-screen w-full bg-muted/40">
             <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex" />
             <main className="flex flex-1 flex-col sm:py-6 sm:pl-14">
                <div className="flex flex-1 items-center justify-center">
                    <p>Cargando...</p>
                </div>
             </main>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar user={user} />
      <main className="flex flex-1 flex-col sm:py-6 sm:pl-14">
        {children}
      </main>
    </div>
  );
}