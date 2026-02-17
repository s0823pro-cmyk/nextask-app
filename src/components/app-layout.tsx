
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { useUser, useAuth } from '@/firebase';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Lock, LogIn, LayoutDashboard, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ⚠️ 重要：ここに管理者のGoogleメールアドレスを入力してください
const ALLOWED_ADMINS = ["[あなたのメールアドレス@gmail.com]"];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicView = pathname?.startsWith('/view/');

  if (!mounted) {
    return <div className="min-h-screen w-full bg-background" />;
  }

  // 共有ポータルは認証なしで表示可能
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 管理者チェック: ログインしていない、または許可されたメールアドレスではない場合
  const isAuthorizedAdmin = user && !user.isAnonymous && user.email && ALLOWED_ADMINS.includes(user.email);

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl border shadow-xl">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              {user && !user.isAnonymous ? (
                <AlertCircle className="h-12 w-12 text-destructive" />
              ) : (
                <Lock className="h-12 w-12 text-primary" />
              )}
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
                ? `現在のアカウント（${user.email}）には管理者権限がありません。許可されたメールアドレスでログインしてください。`
                : '管理画面にアクセスするには管理者アカウントでの認証が必要です。'}
            </p>
          </div>
          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full font-bold shadow-md transition-all active:scale-95" 
              disabled={isLoggingIn}
              onClick={async () => {
                setIsLoggingIn(true);
                try {
                  await initiateGoogleSignIn(auth);
                } catch (error) {
                  toast({
                    title: "ログインエラー",
                    description: "ポップアップがブロックされた可能性があります。ブラウザの設定を確認してください。",
                    variant: "destructive"
                  });
                } finally {
                  setIsLoggingIn(false);
                }
              }}
            >
              {isLoggingIn ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {user && !user.isAnonymous ? '別のアカウントでログイン' : 'Googleでログイン'}
            </Button>
          </div>
          {user && !user.isAnonymous && (
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => auth.signOut()}>
              ログアウト
            </Button>
          )}
        </div>
        <p className="mt-8 text-[10px] text-muted-foreground">
          ※ ログイン画面が表示されない場合は、ブラウザのアドレスバーにあるポップアップブロック解除を許可してください。
        </p>
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
