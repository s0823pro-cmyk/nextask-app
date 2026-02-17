import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AppLayout } from '@/components/app-layout';

export const metadata: Metadata = {
  title: 'NexTask | スマートな建築・工事タスク管理',
  description: '現場の進捗をリアルタイムで共有。取引先別の専用ポータルで透明性の高い業務フローを実現。',
  keywords: ['タスク管理', '現場管理', '建築', '工事', '進捗共有'],
  authors: [{ name: 'NexTask Team' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
