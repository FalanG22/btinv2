"use client"
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import AppLayout from '@/components/layout/app-layout';
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Metadata can still be defined in a client component layout
export const metadata: Metadata = {
  title: 'ZoneScan',
  description: 'Escanea productos y gestiona zonas logísticas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="font-body antialiased">
        {isLoginPage ? (
          children
        ) : (
          <AppLayout>
            {children}
          </AppLayout>
        )}
        <Toaster />
      </body>
    </html>
  );
}
