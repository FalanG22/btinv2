"use server";

import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { getCurrentUser } from '@/lib/session';
import type { AuthenticatedUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  
  // If no user is found, the middleware should have already redirected.
  // This is an extra safeguard.
  if (!user) {
    redirect('/login');
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
