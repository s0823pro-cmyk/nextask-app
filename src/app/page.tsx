
"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Clock, Search, X, Activity, Coins, AlertTriangle, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Client, Task, TaskStatus } from "@/lib/types"
import { useFirestore, useCollection, useMemoFirebase, useAuth, useUser } from "@/firebase"
import { collection } from "firebase/firestore"
import { TaskCard } from "@/components/task-card"
import { toast } from "@/hooks/use-toast"
import { saveTaskWithSync, deleteTaskWithSync } from "@/lib/task-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/task-form"
import { initiateGoogleSignIn } from "@/firebase/non-blocking-login"

// 並び替えのためのカラー順序定義
const COLOR_ORDER: Record<string, number> = {
  "bg-blue-500": 1,
  "bg-green-500": 2,
  "bg-orange-500": 3,
  "bg-red-500": 4,
  "bg-purple-500": 5,
  "bg-pink-500": 6,
}

export default function Home() {
  const db = useFirestore()
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
    if (!isEditOpen && !taskToDelete) {
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = 'auto'
        document.body.style.overflow = 'auto'
      }
    }
  }, [isEditOpen, taskToDelete])

  React.useEffect(() => {
    if (!isEditOpen) {
      const timer = setTimeout(() => {
        setEditingTask(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditOpen])

  const clientsRef = useMemoFirebase(() => collection(db, 'clients'), [db]);
  const { data: clients = [] } = useCollection<Client>(clientsRef);

  const tasksRef = useMemoFirebase(() => collection(db, 'tasks'), [db]);
  const { data: allTasks = [] } = useCollection<Task>(tasksRef);

  const sortedClients = React.useMemo(() => {
    return [...(clients || [])].sort((a, b) => {
      const orderA = COLOR_ORDER[a.color] || 99
      const orderB = COLOR_ORDER[b.color] || 99
      if (orderA !== orderB) return orderA - orderB
      return a.name.localeCompare(b.name, "ja")
    })
  }, [clients])

  const stats = React.useMemo(() => {
    if (!mounted) return { todayTasks: 0, inProgressTasks: 0, awaitingPaymentTasks: 0, overdueTasks: 0 }
    
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const tasks = allTasks || []
    
    const todayTasksCount = tasks.filter(t => 
      t.dueDate === todayStr && (t.status === 'todo' || t.status === 'in_progress')
    ).length

    const inProgressTasksCount = tasks.filter(t => 
      t.status === 'todo' || t.status === 'in_progress'
    ).length

    const awaitingPaymentTasksCount = tasks.filter(t => 
      t.status === 'awaiting_payment'
    ).length

    const overdueTasksCount = tasks.filter(t => {
      if (t.status === 'done' || t.status === 'awaiting_payment' || !t.dueDate) return false
      return t.dueDate < todayStr
    }).length

    return {
      todayTasks: todayTasksCount,
      inProgressTasks: inProgressTasksCount,
      awaitingPaymentTasks: awaitingPaymentTasksCount,
      overdueTasks: overdueTasksCount
    }
  }, [allTasks, mounted])

  const filteredTasks = React.useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return [];

    return (allTasks || []).filter(t => {
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

      return (t.receptionDate || "").includes(paddedSearch) || 
             (t.dueDate || "").includes(paddedSearch) ||
             (t.receptionDate || "").includes(normalizedSearch) ||
             (t.dueDate || "").includes(normalizedSearch);
    });
  }, [allTasks, searchQuery]);

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const task = allTasks?.find(t => t.id === taskId);
    const client = clients?.find(c => c.id === task?.clientId);
    if (task && client) {
      const updatedTask = { ...task, status, updatedAt: new Date().toISOString() };
      saveTaskWithSync(db, updatedTask, client.dedicatedUrlIdentifier);
      toast({ title: "ステータスを更新しました" });
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  }

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      const task = allTasks?.find(t => t.id === taskToDelete);
      const client = clients?.find(c => c.id === task?.clientId);
      deleteTaskWithSync(db, taskToDelete, client?.dedicatedUrlIdentifier);
      toast({ title: "タスクを削除しました", variant: "destructive" });
      setTaskToDelete(null);
    }
  }

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsEditOpen(true);
  }

  const handleUpdateTask = (data: Partial<Task>) => {
    if (!editingTask) return;
    const client = clients?.find(c => c.id === editingTask.clientId);
    if (!client) return;

    setIsEditOpen(false);
    const updatedTask: Task = { 
      ...editingTask, 
      ...data, 
      updatedAt: new Date().toISOString() 
    }
    saveTaskWithSync(db, updatedTask, client.dedicatedUrlIdentifier);
    toast({ title: "タスクを更新しました" });
  }

  const handleGoogleSignIn = () => {
    initiateGoogleSignIn(auth);
  }

  if (!mounted) return null;

  // 匿名ユーザーでもログインしていても表示しますが、
  // 匿名ユーザーの場合はGoogleログインを促すバナーを表示することが可能です。
  const isAnonymous = user?.isAnonymous;

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">NexTask</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            業務効率を最大化するタスク管理プラットフォーム。
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          {isAnonymous && (
            <Button variant="outline" size="sm" onClick={handleGoogleSignIn} className="gap-2">
              <LogIn className="h-4 w-4" />
              Googleアカウントでログイン
            </Button>
          )}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="タスク、日付、工事内容で検索..." 
              className="pl-9 h-11 bg-white border-border/50 shadow-sm focus:ring-primary text-sm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {!searchQuery && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">今日のタスク</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.todayTasks}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">今日の未完了数</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">進行中のタスク</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.inProgressTasks}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">全体の進行中タスク数</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">入金待ち</CardTitle>
              <Coins className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-amber-600">{stats.awaitingPaymentTasks}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">入金確認待ちタスク数</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">期限切れ</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-destructive">{stats.overdueTasks}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground">期日を過ぎた未完了タスク</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6">
        {searchQuery ? (
          <Card className="border-border/50">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Search className="h-5 w-5 text-primary" />
                検索結果: {filteredTasks.length}件
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                「{searchQuery}」に一致するタスクを表示しています。
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
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
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">取引先別ダッシュボード</CardTitle>
              <CardDescription className="text-xs md:text-sm">各取引先の専用ページでタスクを管理できます。</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {sortedClients.map((client) => {
                  const taskCount = (allTasks || []).filter(t => t.clientId === client.id).length
                  const borderColor = client.color.replace('bg-', 'border-')
                  return (
                    <Link 
                      key={client.id} 
                      href={`/${client.id}`}
                      className={`flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors active:scale-[0.98] border-l-4 ${borderColor}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${client.color}`} />
                        <div>
                          <p className="font-bold text-sm md:text-base">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{taskCount}件のタスク</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
