
"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Clock, Search, Activity, Coins, AlertTriangle, Building2, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { TaskCard } from "@/components/task-card"
import { toast } from "@/hooks/use-toast"
import { saveTaskWithSync, deleteTaskWithSync } from "@/lib/task-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/task-form"

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
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

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

  const primeClients = React.useMemo(() => sortedClients.filter(c => c.clientType === 'prime'), [sortedClients]);
  const subClients = React.useMemo(() => sortedClients.filter(c => !c.clientType || c.clientType === 'sub'), [sortedClients]);

  const stats = React.useMemo(() => {
    if (!mounted) return { todayTasks: 0, inProgressTasks: 0, awaitingPaymentTasks: 0, overdueTasks: 0 }
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const tasks = allTasks || []
    
    return {
      todayTasks: tasks.filter(t => t.dueDate === todayStr && (t.status === 'todo' || t.status === 'in_progress')).length,
      inProgressTasks: tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length,
      awaitingPaymentTasks: tasks.filter(t => t.status === 'awaiting_payment').length,
      overdueTasks: tasks.filter(t => t.status !== 'done' && t.status !== 'awaiting_payment' && t.dueDate && t.dueDate < todayStr).length
    }
  }, [allTasks, mounted])

  const filteredTasks = React.useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return [];
    return (allTasks || []).filter(t => 
      (t.title || "").toLowerCase().includes(searchLower) || 
      (t.description || "").toLowerCase().includes(searchLower) ||
      (t.constructionType || "").toLowerCase().includes(searchLower)
    );
  }, [allTasks, searchQuery]);

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const task = (allTasks || []).find(t => t.id === taskId);
    const client = (clients || []).find(c => c.id === task?.clientId);
    if (task && client) {
      const updatedTask = { ...task, status, updatedAt: new Date().toISOString() };
      saveTaskWithSync(db, updatedTask, client.dedicatedUrlIdentifier);
      toast({ title: "ステータスを更新しました" });
    }
  }

  const handleDeleteTask = (taskId: string) => setTaskToDelete(taskId)

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      const task = (allTasks || []).find(t => t.id === taskToDelete);
      const client = (clients || []).find(c => c.id === task?.clientId);
      deleteTaskWithSync(db, taskToDelete, client?.dedicatedUrlIdentifier);
      toast({ title: "タスクを削除しました", variant: "destructive" });
      setTaskToDelete(null);
    }
  }

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsEditOpen(true);
  }

  if (!mounted) return null;

  const renderClientGrid = (clientList: Client[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      {clientList.map((client) => {
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
              <div className="flex flex-col">
                <p className="font-bold text-sm md:text-base">{client.name}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">{taskCount}件のタスク</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">NexTask</h1>
          <p className="text-xs md:text-sm text-muted-foreground">業務効率を最大化するタスク管理プラットフォーム。</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="案件名、内容で検索..." 
              className="pl-9 h-11 bg-white border-border/50 shadow-sm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">進行中</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.inProgressTasks}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">入金待ち</CardTitle>
              <Coins className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-amber-600">{stats.awaitingPaymentTasks}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">期限切れ</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-destructive">{stats.overdueTasks}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6">
        {searchQuery ? (
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-lg">検索結果: {filteredTasks.length}件</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEditClick} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
                ))}
                {filteredTasks.length === 0 && (
                  <p className="col-span-full text-center py-12 text-muted-foreground">一致するタスクはありません。</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">元請け</h2>
              </div>
              {primeClients.length > 0 ? renderClientGrid(primeClients) : (
                <p className="text-sm text-muted-foreground px-4 py-8 border border-dashed rounded-xl text-center">登録なし</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">下請け</h2>
              </div>
              {subClients.length > 0 ? renderClientGrid(subClients) : (
                <p className="text-sm text-muted-foreground px-4 py-8 border border-dashed rounded-xl text-center">登録なし</p>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>タスクを編集</DialogTitle></DialogHeader>
          {editingTask && (
            <TaskForm 
              initialTask={editingTask} 
              onSubmit={(data) => {
                const client = (clients || []).find(c => c.id === editingTask.clientId);
                if (client) {
                  saveTaskWithSync(db, { ...editingTask, ...data, updatedAt: new Date().toISOString() }, client.dedicatedUrlIdentifier);
                  setIsEditOpen(false);
                  toast({ title: "タスクを更新しました" });
                }
              }} 
              onCancel={() => setIsEditOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>この操作は取り消せません。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-destructive text-destructive-foreground">削除する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
