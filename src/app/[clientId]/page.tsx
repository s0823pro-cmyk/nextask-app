
"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Plus, Search, Share2, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Task, TaskStatus, Client } from "@/lib/types"
import { saveTaskWithSync, deleteTaskWithSync, generateId } from "@/lib/task-service"
import { TaskCard } from "@/components/task-card"
import { TaskForm } from "@/components/task-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, doc, query, where } from "firebase/firestore"

export default function ClientDashboard() {
  const { clientId } = useParams<{ clientId: string }>()
  const db = useFirestore()
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null)

  // ダイアログやアラートが閉じた際にポインターイベントを復帰させる共通処理
  React.useEffect(() => {
    if (!isEditOpen && !taskToDelete) {
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = 'auto'
        document.body.style.overflow = 'auto'
      }
    }
  }, [isEditOpen, taskToDelete])

  // 編集データのクリーンアップ
  React.useEffect(() => {
    if (!isEditOpen) {
      const timer = setTimeout(() => {
        setEditingTask(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditOpen])

  const clientRef = useMemoFirebase(() => doc(db, 'clients', clientId), [db, clientId]);
  const { data: client } = useDoc<Client>(clientRef);

  const tasksQuery = useMemoFirebase(() => {
    return query(collection(db, 'tasks'), where('clientId', '==', clientId));
  }, [db, clientId]);
  const { data: tasks = [], isLoading } = useCollection<Task>(tasksQuery);

  const handleCreateTask = (data: Partial<Task>) => {
    if (!client) return;
    
    setIsCreateOpen(false);
    
    const now = new Date().toISOString();
    const newTask: Task = {
      id: generateId(),
      clientId,
      title: data.title || "",
      description: data.description || "",
      constructionType: data.constructionType || "",
      status: data.status || "in_progress",
      receptionDate: data.receptionDate || now.split('T')[0],
      dueDate: data.dueDate || now.split('T')[0],
      subtasks: [],
      pdfs: data.pdfs || [],
      createdAt: now,
      updatedAt: now,
    }
    
    saveTaskWithSync(db, newTask, client.dedicatedUrlIdentifier);
    toast({ title: "タスクを作成しました" });
  }

  const handleUpdateTask = (data: Partial<Task>) => {
    if (!editingTask || !client) return;
    
    setIsEditOpen(false);
    
    const updatedTask: Task = { 
      ...editingTask, 
      ...data, 
      updatedAt: new Date().toISOString() 
    }
    
    saveTaskWithSync(db, updatedTask, client.dedicatedUrlIdentifier);
    toast({ title: "タスクを更新しました" });
  }

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  }

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTaskWithSync(db, taskToDelete, client?.dedicatedUrlIdentifier);
      toast({ title: "タスクを削除しました", variant: "destructive" });
      setTaskToDelete(null);
    }
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const task = tasks?.find(t => t.id === taskId);
    if (task && client) {
      const updatedTask = { ...task, status, updatedAt: new Date().toISOString() };
      saveTaskWithSync(db, updatedTask, client.dedicatedUrlIdentifier);
      toast({ title: "ステータスを更新しました" });
    }
  }

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsEditOpen(true);
  }

  const copyShareLink = async () => {
    if (!client) return;
    const url = `${window.location.origin}/view/${client.dedicatedUrlIdentifier}`;
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `NexTask | ${client.name} の業務フロー`,
          text: `${client.name} 様のタスク進捗状況はこちらからご確認いただけます。`,
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast({ title: "共有URLをコピーしました" });
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "共有URLをコピーしました" });
    }
  }

  const filteredTasks = React.useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return (tasks || []);

    return (tasks || []).filter(t => {
      const title = (t.title || "").toLowerCase();
      const description = (t.description || "").toLowerCase();
      const constructionType = (t.constructionType || "").toLowerCase();
      
      const matchText = title.includes(searchLower) || 
                       description.includes(searchLower) ||
                       constructionType.includes(searchLower);
      
      if (matchText) return true;

      const normalizedSearch = searchLower.replace(/[\/\.]/g, '-');
      const dateParts = normalizedSearch.split('-');
      const paddedSearch = dateParts.map(part => {
        if (/^\d{1,2}$/.test(part)) {
          return part.padStart(2, '0');
        }
        return part;
      }).join('-');

      const matchDate = (t.receptionDate || "").includes(paddedSearch) || 
                       (t.dueDate || "").includes(paddedSearch) ||
                       (t.receptionDate || "").includes(normalizedSearch) ||
                       (t.dueDate || "").includes(normalizedSearch);

      return matchDate;
    })
  }, [tasks, searchQuery]);

  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress' || t.status === 'todo')
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending')
  const awaitingPaymentTasks = filteredTasks.filter(t => t.status === 'awaiting_payment')
  const doneTasks = filteredTasks.filter(t => t.status === 'done')

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full ${client?.color || 'bg-gray-400'}`} />
            <span className="text-xs md:text-sm font-medium text-muted-foreground">取引先</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {client?.name || '読み込み中...'} の業務フロー
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">タスクの進捗をリアルタイムで管理・更新します。</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyShareLink} className="h-10 flex-1 md:flex-none">
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
            共有URLを
            <span className="hidden sm:inline">コピー</span>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 bg-primary hover:bg-primary/90 flex-1 md:flex-none">
                <Plus className="mr-2 h-4 w-4" /> 新規タスク
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-xl">
              <DialogHeader>
                <DialogTitle>新しいタスクを作成</DialogTitle>
              </DialogHeader>
              <TaskForm 
                onSubmit={handleCreateTask} 
                onCancel={() => setIsCreateOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="名前、工事内容、説明などで検索..." 
            className="pl-9 bg-white border-border/50 text-sm" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="bg-muted/50 p-1 w-full justify-start md:justify-center">
            <TabsTrigger value="all" className="flex-1 min-w-[80px]">すべて ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="in_progress" className="flex-1 min-w-[80px]">進行中 ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 min-w-[80px]">保留 ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="awaiting_payment" className="flex-1 min-w-[80px]">入金待ち ({awaitingPaymentTasks.length})</TabsTrigger>
            <TabsTrigger value="done" className="flex-1 min-w-[80px]">完了 ({doneTasks.length})</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={handleEditClick}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          {!isLoading && filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
              <Plus className="h-12 w-12 mb-4 opacity-20" />
              <p>タスクが見つかりませんでした。</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="in_progress" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditClick} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditClick} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="awaiting_payment" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {awaitingPaymentTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditClick} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="done" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {doneTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditClick} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>タスクを編集</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm 
              initialTask={editingTask} 
              onSubmit={handleUpdateTask} 
              onCancel={() => setIsEditOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このタスクを削除してもよろしいですか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTask} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
