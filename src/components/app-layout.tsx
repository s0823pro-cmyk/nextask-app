'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { useUser, useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Lock, LogIn, LayoutDashboard, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// 管理者として許可するGoogleアカウント
const ALLOWED_ADMINS = ["s0823.pro@gmail.com"];

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

  // 共有ポータルは認証ガードをスキップ
  if (isPublicView) {
    return (
      <div className="min-h-screen w-full bg-background overflow-auto">
        {children}
      </div>
    );
  }

  // 認証情報の初期読み込み中
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  // 管理者チェック (s0823.pro@gmail.com のみ許可)
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
              <span className="font-bold text-xl">NexTask Admin</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user && !user.isAnonymous ? 'アクセス権限がありません' : '管理者ログイン'}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {user && !user.isAnonymous 
                ? `現在のアカウント（${user.email}）は管理者ではありません。許可されたアカウントで再ログインしてください。`
                : '管理画面にアクセスするには管理者アカウントでの認証が必要です。'}
            </p>
          </div>
          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full font-bold shadow-md h-12" 
              disabled={isLoggingIn}
              onClick={async () => {
                if (isLoggingIn) return;
                setIsLoggingIn(true);
                const provider = new GoogleAuthProvider();
                provider.setCustomParameters({ prompt: 'select_account' });
                
                try {
                  await signInWithPopup(auth, provider);
                  toast({ title: "ログインに成功しました" });
                } catch (error: any) {
                  console.error("Login error detail:", error);
                  let errorMessage = "認証中にエラーが発生しました。しばらく時間をおいて試すか、Firebaseの設定を確認してください。";
                  
                  if (error.code === 'auth/popup-blocked') {
                    errorMessage = "ブラウザのポップアップブロックを解除してください。";
                  } else if (error.code === 'auth/unauthorized-domain') {
                    const currentDomain = window.location.hostname;
                    errorMessage = `このドメイン（${currentDomain}）がFirebaseで許可されていません。Firebaseコンソールの [Authentication] > [設定] > [承認済みドメイン] にこのドメインを追加してください。`;
                  } else if (error.code === 'auth/operation-not-allowed') {
                    errorMessage = "Googleログインが有効になっていません。Firebaseコンソールの [Authentication] でGoogleを有効にしてください。";
                  }
                  
                  toast({
                    title: "ログイン失敗",
                    description: errorMessage,
                    variant: "destructive",
                    duration: 10000,
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
              {user && !user.isAnonymous ? '別のアカウントでログイン' : 'Googleアカウントでログイン'}
            </Button>
          </div>
          {user && (
            <div className="flex flex-col gap-2 pt-4 border-t">
               <p className="text-[10px] text-muted-foreground">ログイン中: {user.email || '匿名ユーザー'}</p>
               <Button variant="ghost" size="sm" onClick={() => auth.signOut()}>
                ログアウト
              </Button>
            </div>
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
