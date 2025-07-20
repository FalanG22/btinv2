import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <main className="flex flex-1 flex-col sm:py-6 sm:pl-14">
        {children}
      </main>
    </div>
  );
}
