import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { getCurrentUser } from '@/lib/session';

export default function AppLayout({ children }: { children: ReactNode }) {
  // We can remove the async/await here as the parent layout will handle suspense.
  // The user data will be fetched in the Sidebar component itself.
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <main className="flex flex-1 flex-col sm:py-6 sm:pl-14">
        {children}
      </main>
    </div>
  );
}
