
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { useUser, useAuth } from '@/firebase';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Lock, LogIn, LayoutDashboard, AlertCircle } from 'lucide-react';

// 管理者として許可するメールアドレスのリスト
const ALLOWED_ADMINS = ["YOUR_EMAIL@gmail.com"];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicView = pathname?.startsWith('/view/');

  if (!mounted) {
    return <div className="min-h-screen w-full bg-background" />;
  }

  if (isPublicView) {
    return (
      <div className="min-h-screen w-full bg-background overflow-auto">
        {children}
      </div>
    );
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 管理者チェック: ログインしていない、匿名、または許可されたメールアドレスではない場合
  const isAuthorizedAdmin = user && !user.isAnonymous && user.email && ALLOWED_ADMINS.includes(user.email);

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl border shadow-xl">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              {user && !user.isAnonymous ? <AlertCircle className="h-12 w-12 text-destructive" /> : <Lock className="h-12 w-12 text-primary" />}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="font-bold text-xl">NexTask</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user && !user.isAnonymous ? 'アクセス権限がありません' : '管理者ログイン'}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {user && !user.isAnonymous 
                ? `アカウント（${user.email}）には管理者権限がありません。管理者用のアカウントで再度ログインしてください。`
                : '管理画面にアクセスするには管理者アカウントでの認証が必要です。登録済みのGoogleアカウントでログインしてください。'}
            </p>
          </div>
          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full font-bold shadow-md transition-all active:scale-95" 
              onClick={() => initiateGoogleSignIn(auth)}
            >
              <LogIn className="mr-2 h-5 w-5" /> 
              {user && !user.isAnonymous ? '別のアカウントでログイン' : 'Googleでログイン'}
            </Button>
          </div>
          {user && !user.isAnonymous && (
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => auth.signOut()}>
              ログアウト
            </Button>
          )}
        </div>
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
