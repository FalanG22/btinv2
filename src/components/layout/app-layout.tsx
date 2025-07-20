"use server";

import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { getCurrentUser } from '@/lib/session';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  
  // This layout will now be used for all authenticated pages.
  // The logic to show/hide it is handled by page-level layouts.
  if (!user) {
    // In our simplified setup, this should never happen,
    // but it's a good safeguard.
    return <>{children}</>;
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
