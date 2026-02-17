
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { useUser, useAuth } from '@/firebase';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Lock, LogIn, LayoutDashboard } from 'lucide-react';

/**
 * アプリケーションのメインレイアウトを管理するコンポーネント。
 * 管理者認証のチェックを行い、ログインしていない場合はログイン画面を表示します。
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 共有用ページ（/view/...）の場合は認証不要
  const isPublicView = pathname?.startsWith('/view/');

  if (!mounted) {
    return <div className="min-h-screen w-full bg-background" />;
  }

  // 共有ポータルの場合はそのまま表示
  if (isPublicView) {
    return (
      <div className="min-h-screen w-full bg-background overflow-auto">
        {children}
      </div>
    );
  }

  // ローディング中
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 管理者チェック: ログインしていない、または匿名ユーザーの場合はログイン画面を表示
  if (!user || user.isAnonymous) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl border shadow-xl">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="font-bold text-xl">NexTask</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">管理者ログイン</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              管理画面にアクセスするには管理者アカウントでの認証が必要です。登録済みのGoogleアカウントでログインしてください。
            </p>
          </div>
          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full font-bold shadow-md transition-all active:scale-95" 
              onClick={() => initiateGoogleSignIn(auth)}
            >
              <LogIn className="mr-2 h-5 w-5" /> Googleでログイン
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground pt-4 border-t">
            ※関係者以外の方は、共有された専用ポータルURLから閲覧してください。
          </p>
        </div>
      </div>
    );
  }

  // 管理者の場合は通常の管理画面レイアウトを表示
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
