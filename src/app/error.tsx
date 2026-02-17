
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
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
            申し訳ありません。画面の読み込み中に予期せぬエラーが発生しました。
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={() => reset()} className="w-full">
            再読み込みを試す
          </Button>
          <Button variant="outline" asChild className="w-full">
            <a href="/">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              ホームに戻る
            </a>
          </Button>
        </div>
        <div className="pt-4 text-[10px] text-muted-foreground/50 font-mono break-all">
          {error.message || "Unknown error"}
        </div>
      </div>
    </div>
  );
}
