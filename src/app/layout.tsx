import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import AppLayout from '@/components/layout/app-layout';
import { getCurrentUser } from '@/lib/session';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ZoneScan',
  description: 'Escanea productos y gestiona zonas logísticas',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="font-body antialiased">
        {user ? <AppLayout>{children}</AppLayout> : children}
        <Toaster />
      </body>
    </html>
  );
}
