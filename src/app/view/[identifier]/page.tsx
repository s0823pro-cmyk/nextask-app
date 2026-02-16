
"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, Clock, Calendar, LayoutDashboard, FileText, Paperclip } from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusConfig = {
  todo: { label: "進行中", color: "bg-blue-50 text-blue-700", icon: Clock },
  in_progress: { label: "進行中", color: "bg-blue-50 text-blue-700", icon: Clock },
  done: { label: "完了", color: "bg-primary/10 text-primary", icon: CheckCircle2 },
}

export default function PublicClientView() {
  const { identifier } = useParams<{ identifier: string }>()
  const db = useFirestore()

  const tasksQuery = useMemoFirebase(() => {
    return collection(db, 'client_task_views', identifier, 'tasks');
  }, [db, identifier]);
  const { data: tasksData, isLoading } = useCollection<Task>(tasksQuery);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const tasks = tasksData || []

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <div className="bg-primary/10 p-2 rounded-xl">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">DailyFlow Portal</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mt-4">業務進捗ダッシュボード</h1>
          <p className="text-muted-foreground text-lg">リアルタイムの作業進捗をいつでもご確認いただけます。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <PublicTaskCard key={task.id} task={task} />
          ))}
        </div>
        {tasks.length === 0 && <EmptyState />}
      </div>
    </div>
  )
}

function PublicTaskCard({ task }: { task: Task }) {
  const { label, color, icon: StatusIcon } = statusConfig[task.status] || statusConfig.in_progress
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done'

  const handleViewPdf = () => {
    if (task.pdfData) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe width='100%' height='100%' src='${task.pdfData}'></iframe>`
        );
        newWindow.document.title = task.pdfName || "PDF Document";
      }
    }
  }

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative flex flex-col">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", 
        task.status === 'done' ? "bg-primary" : "bg-blue-500"
      )} />
      
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={cn("font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-wider", color)}>
            <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
            {label}
          </Badge>
          {task.pdfData && (
            <Badge variant="secondary" className="px-2.5 py-0.5 text-[10px] font-bold bg-muted text-muted-foreground border-none">
              <Paperclip className="w-3 h-3 mr-1" />
              資料あり
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-bold leading-tight line-clamp-2">{task.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 pl-7 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 min-h-[3rem] leading-relaxed">
          {task.description || "詳細説明はありません。"}
        </p>
        
        <div className="space-y-3 mt-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
              <FileText className="w-4 h-4 text-primary/50" />
              <span>受付日: {task.receptionDate ? format(new Date(task.receptionDate), "yyyy年MM月dd日") : "-"}</span>
            </div>
            <div className={cn(
              "flex items-center gap-2 text-[11px] font-semibold p-2 rounded-lg",
              isOverdue ? "bg-destructive/5 text-destructive" : "bg-muted/50 text-muted-foreground"
            )}>
              <Calendar className="w-4 h-4 text-primary/50" />
              <span>完了予定: {format(new Date(task.dueDate), "yyyy年MM月dd日")}</span>
              {isOverdue && <span className="ml-auto text-[9px] font-black uppercase tracking-tighter">Overdue</span>}
            </div>
          </div>

          {task.pdfData && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-all font-bold"
              onClick={handleViewPdf}
            >
              <Paperclip className="w-3 h-3 mr-2" />
              添付資料(PDF)を表示
            </Button>
          )}

          <div className="text-muted-foreground/50 text-[10px] italic pt-2 border-t border-border/50">
            最終更新: {format(new Date(task.updatedAt), "yyyy/MM/dd HH:mm")}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-32 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
      <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Clock className="w-8 h-8 text-muted-foreground opacity-20" />
      </div>
      <p className="text-muted-foreground font-medium">現在、表示できるタスクはありません。</p>
    </div>
  )
}
