
"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, Clock, Calendar, LayoutDashboard, FileText, Paperclip, Search, Eye } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

const statusConfig = {
  todo: { label: "進行中", color: "bg-blue-50 text-blue-700", icon: Clock },
  in_progress: { label: "進行中", color: "bg-blue-50 text-blue-700", icon: Clock },
  pending: { label: "保留", color: "bg-orange-50 text-orange-700", icon: Clock },
  done: { label: "完了", color: "bg-primary/10 text-primary", icon: CheckCircle2 },
}

export default function PublicClientView() {
  const { identifier } = useParams<{ identifier: string }>()
  const db = useFirestore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const tasksQuery = useMemoFirebase(() => {
    return collection(db, 'client_task_views', identifier, 'tasks');
  }, [db, identifier]);
  const { data: tasksData, isLoading } = useCollection<Task>(tasksQuery);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const tasks = tasksData || []

  const filteredTasks = tasks.filter(t => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return true;

    const matchText = (t.title?.toLowerCase() || "").includes(searchLower) || 
                     (t.description?.toLowerCase() || "").includes(searchLower);
    
    if (matchText) return true;

    const normalizedSearch = searchLower.replace(/[\/\.]/g, '-');
    const dateParts = normalizedSearch.split('-');
    const paddedSearch = dateParts.map(part => {
      if (/^\d{1,2}$/.test(part)) {
        return part.padStart(2, '0');
      }
      return part;
    }).join('-');

    return t.receptionDate?.includes(paddedSearch) || 
           t.dueDate?.includes(paddedSearch) ||
           t.receptionDate?.includes(normalizedSearch) ||
           t.dueDate?.includes(normalizedSearch);
  });

  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress' || t.status === 'todo')
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending')
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
              <span className="font-bold text-xl md:text-2xl tracking-tight">DailyFlow Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter mt-4">業務進捗</h1>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="検索..." 
              className="pl-9 h-11 bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="flex-1">すべて ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="in_progress" className="flex-1">進行中 ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">保留 ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="done" className="flex-1">完了 ({doneTasks.length})</TabsTrigger>
          </TabsList>

          {["all", "in_progress", "pending", "done"].map((val) => {
            const list = val === "all" ? filteredTasks : val === "in_progress" ? inProgressTasks : val === "pending" ? pendingTasks : doneTasks
            return (
              <TabsContent key={val} value={val} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {list.map((task) => (
                    <PublicTaskCard key={task.id} task={task} />
                  ))}
                </div>
                {list.length === 0 && <EmptyState isSearching={!!searchQuery} />}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}

function PublicTaskCard({ task }: { task: Task }) {
  const { label, color, icon: StatusIcon } = statusConfig[task.status] || statusConfig.in_progress
  
  const formatDateSafe = (dateStr: string | undefined) => {
    if (!dateStr) return "-"
    const date = parseISO(dateStr)
    return isValid(date) ? format(date, "yyyy年MM月dd日") : "-"
  }

  const isOverdue = React.useMemo(() => {
    if (task.status === 'done' || !task.dueDate) return false
    try {
      return new Date(task.dueDate) < new Date()
    } catch {
      return false
    }
  }, [task.dueDate, task.status])

  const handleViewPdf = () => {
    if (task.pdfData) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe width='100%' height='100%' src='${task.pdfData}'></iframe>`);
        newWindow.document.title = task.pdfName || "資料";
      }
    }
  }

  return (
    <Card className="border-border/50 relative flex flex-col group overflow-hidden">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", 
        task.status === 'done' ? "bg-primary" : task.status === 'pending' ? "bg-orange-500" : "bg-blue-500"
      )} />
      
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px]", color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {label}
          </Badge>
          {task.pdfData && <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">資料あり</Badge>}
        </div>
        <CardTitle className="text-lg font-bold line-clamp-2">{task.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pl-6 flex-1 flex flex-col">
        <p className="text-xs text-muted-foreground line-clamp-3 mb-4">
          {task.description || "詳細なし"}
        </p>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-primary text-[11px] font-bold flex items-center gap-1 mb-4">
              <Eye className="w-3 h-3" /> 全文を確認
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] w-[95vw]">
            <DialogHeader><DialogTitle>{task.title}</DialogTitle></DialogHeader>
            <ScrollArea className="max-h-[60vh] mt-4 p-4 border rounded-md">
              <div className="text-sm whitespace-pre-wrap">{task.description}</div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        
        <div className="space-y-2 mt-auto">
          <div className="text-[10px] text-muted-foreground flex items-center gap-2">
            <FileText className="w-3 h-3" /> 受付: {formatDateSafe(task.receptionDate)}
          </div>
          <div className={cn("text-[10px] flex items-center gap-2 p-1.5 rounded", isOverdue ? "bg-destructive/5 text-destructive font-bold" : "text-muted-foreground")}>
            <Calendar className="w-3 h-3" /> 予定: {formatDateSafe(task.dueDate)}
          </div>
          {task.pdfData && (
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleViewPdf}>
              <Paperclip className="w-3 h-3 mr-2" /> 添付資料を表示
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ isSearching }: { isSearching: boolean }) {
  return (
    <div className="text-center py-24 bg-muted/20 rounded-2xl border-2 border-dashed">
      <p className="text-muted-foreground">
        {isSearching ? "一致するタスクが見つかりませんでした。" : "タスクはありません。"}
      </p>
    </div>
  )
}
