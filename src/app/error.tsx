
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsPublic(pathname?.startsWith('/view/') || false);
  }, [pathname]);

  if (!mounted) return null;

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
          <p className="text-muted-foreground text-sm leading-relaxed">
            申し訳ありません。画面の読み込み中に問題が発生しました。ブラウザの再読み込みを試すか、しばらく時間をおいてから再度アクセスしてください。
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={() => reset()} className="w-full font-bold shadow-md">
            <RefreshCcw className="mr-2 h-4 w-4" />
            再読み込みしてリトライ
          </Button>
          
          {!isPublic && (
            <Button variant="outline" asChild className="w-full font-bold">
              <a href="/">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                ホーム（管理画面）に戻る
              </a>
            </Button>
          )}

          {isPublic && (
            <p className="text-xs text-muted-foreground pt-4">
              ※解決しない場合は、共有されたURLが正しいか発行元にご確認ください。
            </p>
          )}
        </div>
        
        <div className="pt-6 mt-6 border-t text-[10px] text-left text-muted-foreground/30 font-mono break-all max-h-24 overflow-auto">
          <p className="font-bold mb-1">Info:</p>
          {error?.message || "Render error"}
        </div>
      </div>
    </div>
  );
}
