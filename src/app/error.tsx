
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client-side exception caught:", error);
  }, [error]);

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
            申し訳ありません。画面の読み込み中に問題が発生しました。ブラウザの再読み込みを試すか、ホームに戻ってください。
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={() => reset()} className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            再試行する
          </Button>
          <Button variant="outline" asChild className="w-full">
            <a href="/">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              ホームに戻る
            </a>
          </Button>
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
