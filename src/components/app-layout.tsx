
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';

/**
 * アプリケーションのメインレイアウトを管理するコンポーネント。
 * パスに応じてサイドバーの表示・非表示を切り替えます。
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // 共有用ページ（/view/...）の場合はサイドバーを表示しない
  const isPublicView = pathname?.startsWith('/view/');

  if (isPublicView) {
    return (
      <div className="min-h-screen w-full bg-background overflow-auto">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <SidebarNav />
        <SidebarInset className="bg-background">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
