
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, AlertCircle, RefreshCcw } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    console.error("Client-side exception caught:", error);
    // 共有URLかどうかを判定
    setIsPublic(pathname?.startsWith('/view/') || false);
  }, [error, pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 text-center bg-card p-8 rounded-2xl border shadow-xl">
        <div className="flex justify-center">
          <div className="bg-destructive/10 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">エラーが発生しました</h1>
          <p className="text-muted-foreground text-sm">
            申し訳ありません。画面の読み込み中に問題が発生しました。ブラウザの再読み込みを試すか、しばらく時間をおいてから再度アクセスしてください。
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={() => reset()} className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            再読み込みしてリトライ
          </Button>
          
          {/* 管理画面へのリンクは、現在のページが共有用でない場合のみ表示 */}
          {!isPublic && (
            <Button variant="outline" asChild className="w-full">
              <a href="/">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                ホームに戻る
              </a>
            </Button>
          )}
        </div>
        {process.env.NODE_ENV !== 'production' && (
          <div className="pt-4 text-[10px] text-left text-muted-foreground/50 font-mono break-all max-h-40 overflow-auto border-t">
            {error.message || "Unknown error"}
            <br />
            {error.stack}
          </div>
        )}
      </div>
    </div>
  );
}
