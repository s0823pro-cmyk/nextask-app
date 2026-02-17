
"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, Clock, Calendar, LayoutDashboard, FileText, Paperclip, Search, Eye, HardHat, Coins, Download, AlertCircle, Loader2 } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

const statusConfig = {
  todo: { label: "進行中", color: "bg-blue-50 text-blue-700", icon: Clock },
  in_progress: { label: "進行中", color: "bg-blue-50 text-blue-700", icon: Clock },
  pending: { label: "保留", color: "bg-orange-50 text-orange-700", icon: Clock },
  awaiting_payment: { label: "入金待ち", color: "bg-amber-50 text-amber-700", icon: Coins },
  done: { label: "完了", color: "bg-primary/10 text-primary", icon: CheckCircle2 },
}

export default function PublicClientView() {
  const params = useParams()
  const identifier = params?.identifier as string
  const db = useFirestore()
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const tasksQuery = useMemoFirebase(() => {
    if (!identifier || !db) return null;
    try {
      const cleanId = String(identifier).trim();
      if (!cleanId || cleanId === 'undefined') return null;
      return collection(db, 'client_task_views', cleanId, 'tasks');
    } catch (e) {
      return null;
    }
  }, [db, identifier]);
  
  const { data: tasksData, isLoading, error } = useCollection<Task>(tasksQuery, { 
    suppressGlobalError: true 
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || (!isLoading && !tasksData && identifier && identifier !== 'undefined')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <Card className="max-w-md w-full border shadow-xl p-8 space-y-6 rounded-2xl">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">アクセスできません</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              このURLは無効であるか、閲覧権限が制限されています。正しいURLを使用しているかご確認ください。
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
            再読み込みしてリトライ
          </Button>
        </Card>
      </div>
    );
  }

  const tasks = Array.isArray(tasksData) ? tasksData : []

  const filteredTasks = tasks.filter(t => {
    if (!t) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (t.title || "").toLowerCase().includes(q) || 
           (t.description || "").toLowerCase().includes(q) ||
           (t.constructionType || "").toLowerCase().includes(q);
  });

  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress' || t.status === 'todo')
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending')
  const awaitingPaymentTasks = filteredTasks.filter(t => t.status === 'awaiting_payment')
  const doneTasks = filteredTasks.filter(t => t.status === 'done')

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <div className="bg-primary/10 p-2 rounded-xl">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl md:text-2xl tracking-tight">NexTask Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter mt-4">業務進捗</h1>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="案件名などで検索..." 
              className="pl-9 h-11 bg-white border-border/50 shadow-sm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="in_progress" className="w-full">
            <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto h-12 p-1">
              <TabsTrigger value="in_progress" className="flex-1 py-2">進行中 ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1 py-2">保留 ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="awaiting_payment" className="flex-1 py-2">入金待ち ({awaitingPaymentTasks.length})</TabsTrigger>
              <TabsTrigger value="done" className="flex-1 py-2">完了 ({doneTasks.length})</TabsTrigger>
              <TabsTrigger value="all" className="flex-1 py-2">すべて ({filteredTasks.length})</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="in_progress">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {inProgressTasks.map((task) => <PublicTaskCard key={task.id} task={task} />)}
                </div>
                {inProgressTasks.length === 0 && <EmptyState />}
              </TabsContent>
              <TabsContent value="pending">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {pendingTasks.map((task) => <PublicTaskCard key={task.id} task={task} />)}
                </div>
                {pendingTasks.length === 0 && <EmptyState />}
              </TabsContent>
              <TabsContent value="awaiting_payment">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {awaitingPaymentTasks.map((task) => <PublicTaskCard key={task.id} task={task} />)}
                </div>
                {awaitingPaymentTasks.length === 0 && <EmptyState />}
              </TabsContent>
              <TabsContent value="done">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {doneTasks.map((task) => <PublicTaskCard key={task.id} task={task} />)}
                </div>
                {doneTasks.length === 0 && <EmptyState />}
              </TabsContent>
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredTasks.map((task) => <PublicTaskCard key={task.id} task={task} />)}
                </div>
                {filteredTasks.length === 0 && <EmptyState />}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 border-2 border-dashed rounded-2xl text-muted-foreground">
      該当するタスクはありません。
    </div>
  )
}

function PublicTaskCard({ task }: { task: Task }) {
  const config = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.in_progress
  const StatusIcon = config.icon
  
  const formatDateSafe = (dateStr: string | undefined | null) => {
    if (!dateStr) return "-"
    try {
      const date = parseISO(dateStr)
      return isValid(date) ? format(date, "yyyy年MM月dd日") : "-"
    } catch {
      return "-"
    }
  }

  // 同期的なPDF処理ロジック (スマートフォン対応)
  const handlePdfAction = (data: string) => {
    try {
      const parts = data.split(',');
      if (parts.length < 2) return;
      
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      
      // スマートフォンでも確実に別タブで開くためにリンクを生成してクリック
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // リソース解放
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error("PDF viewing error:", err);
    }
  }

  const isOverdue = React.useMemo(() => {
    if (task.status === 'done' || task.status === 'awaiting_payment' || !task.dueDate) return false
    try {
      const date = parseISO(task.dueDate)
      if (!isValid(date)) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date.getTime() < today.getTime()
    } catch {
      return false
    }
  }, [task.dueDate, task.status])

  const pdfCount = Array.isArray(task.pdfs) ? task.pdfs.length : 0

  return (
    <Card className="border-border/50 relative flex flex-col group overflow-hidden bg-card hover:shadow-md transition-shadow">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", 
        task.status === 'done' ? "bg-primary" : task.status === 'pending' ? "bg-orange-500" : task.status === 'awaiting_payment' ? "bg-amber-500" : "bg-blue-500"
      )} />
      
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] border-none font-bold", config.color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
          {task.constructionType && (
            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 border-none font-bold">
              <HardHat className="w-3 h-3 mr-1" />
              {task.constructionType}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-bold line-clamp-2 leading-snug">{task.title || "無題のタスク"}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pl-6 flex-1 flex flex-col">
        <p className="text-xs text-muted-foreground line-clamp-3 mb-4 min-h-[3rem] leading-relaxed">
          {task.description || "詳細説明はありません。"}
        </p>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-primary text-[11px] font-bold flex items-center gap-1 mb-4 hover:underline text-left">
              <Eye className="w-3 h-3 inline mr-1" /> 内容を詳しく見る
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-2xl">
            <DialogHeader><DialogTitle className="text-xl">{task.title || "タスク詳細"}</DialogTitle></DialogHeader>
            <ScrollArea className="max-h-[60vh] mt-4 p-4 border rounded-xl bg-muted/10">
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{task.description || "詳細説明はありません。"}</div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        
        <div className="space-y-3 mt-auto border-t border-border/50 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">受付日</p>
              <div className="text-[11px] text-foreground flex items-center gap-1.5 font-medium">
                <FileText className="w-3 h-3 opacity-50" />
                {formatDateSafe(task.receptionDate)}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">期日</p>
              <div className={cn("text-[11px] flex items-center gap-1.5 p-1 -ml-1 rounded font-medium", isOverdue ? "text-destructive font-bold bg-destructive/5" : "text-foreground")}>
                <Calendar className="w-3 h-3 opacity-50" />
                {formatDateSafe(task.dueDate)}
              </div>
            </div>
          </div>

          {pdfCount > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">添付資料 ({pdfCount}) ※タップで閲覧</p>
              <div className="flex flex-col gap-1.5">
                {task.pdfs?.map((pdf, idx) => (
                  <Button 
                    key={idx}
                    variant="outline" 
                    size="sm" 
                    className="w-full text-[10px] h-10 justify-start px-3 bg-primary/5 border-primary/10 overflow-hidden font-bold hover:bg-primary/10 text-primary" 
                    onClick={() => handlePdfAction(pdf.data)}
                  >
                    <Paperclip className="w-3 h-3 mr-2 shrink-0 opacity-70" />
                    <span className="truncate">{pdf.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
