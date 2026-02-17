"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Plus, Search, Share2, Check, Building2, Users } from "lucide-react"
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

  const clientRef = useMemoFirebase(() => doc(db, 'clients', clientId), [db, clientId]);
  const { data: client } = useDoc<Client>(clientRef);

  const tasksQuery = useMemoFirebase(() => {
    return query(collection(db, 'tasks'), where('clientId', '==', clientId));
  }, [db, clientId]);
  const { data: tasks, isLoading } = useCollection<Task>(tasksQuery);

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
    const updatedTask: Task = { ...editingTask, ...data, updatedAt: new Date().toISOString() }
    saveTaskWithSync(db, updatedTask, client.dedicatedUrlIdentifier);
    toast({ title: "タスクを更新しました" });
  }

  const handleDeleteTask = (taskId: string) => setTaskToDelete(taskId)

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTaskWithSync(db, taskToDelete, client?.dedicatedUrlIdentifier);
      toast({ title: "削除しました", variant: "destructive" });
      setTaskToDelete(null);
    }
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const task = (tasks || []).find(t => t.id === taskId);
    if (task && client) {
      saveTaskWithSync(db, { ...task, status, updatedAt: new Date().toISOString() }, client.dedicatedUrlIdentifier);
      toast({ title: "ステータスを更新しました" });
    }
  }

  const copyShareLink = async () => {
    if (!client) return;
    const url = `${window.location.origin}/view/${client.dedicatedUrlIdentifier}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "共有URLをコピーしました" });
    } catch (err) {
      toast({ title: "コピーに失敗しました", variant: "destructive" });
    }
  }

  const filteredTasks = (tasks || []).filter(t => 
    (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.constructionType || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inProgressList = filteredTasks.filter(t => t.status === 'in_progress' || t.status === 'todo');
  const pendingList = filteredTasks.filter(t => t.status === 'pending');
  const awaitingPaymentList = filteredTasks.filter(t => t.status === 'awaiting_payment');
  const doneList = filteredTasks.filter(t => t.status === 'done');

  const renderTaskGrid = (taskList: Task[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {taskList.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={(t) => { setEditingTask(t); setIsEditOpen(true); }} 
          onDelete={handleDeleteTask} 
          onStatusChange={handleStatusChange} 
        />
      ))}
      {taskList.length === 0 && !isLoading && (
        <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
          タスクが見つかりませんでした。
        </div>
      )}
    </div>
  )

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${client?.color || 'bg-gray-400'}`} />
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              {client?.clientType === 'prime' ? <Building2 className="h-3 w-3" /> : <Users className="h-3 w-3" />}
              {client?.clientType === 'prime' ? '元請け' : '下請け'}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{client?.name || '読み込み中...'}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyShareLink} className="h-10">
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
            共有URLをコピー
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-10"><Plus className="mr-2 h-4 w-4" /> 新規タスク</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-xl">
              <DialogHeader><DialogTitle>新しいタスク</DialogTitle></DialogHeader>
              <TaskForm onSubmit={handleCreateTask} onCancel={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="タスクを検索..." 
          className="pl-9" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="in_progress" className="w-full">
        <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto">
          <TabsTrigger value="in_progress" className="flex-1">進行中 ({inProgressList.length})</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">保留 ({pendingList.length})</TabsTrigger>
          <TabsTrigger value="awaiting_payment" className="flex-1">入金待ち ({awaitingPaymentList.length})</TabsTrigger>
          <TabsTrigger value="done" className="flex-1">完了 ({doneList.length})</TabsTrigger>
          <TabsTrigger value="all" className="flex-1">すべて ({filteredTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="in_progress" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : renderTaskGrid(inProgressList)}
        </TabsContent>
        <TabsContent value="pending" className="mt-6">{renderTaskGrid(pendingList)}</TabsContent>
        <TabsContent value="awaiting_payment" className="mt-6">{renderTaskGrid(awaitingPaymentList)}</TabsContent>
        <TabsContent value="done" className="mt-6">{renderTaskGrid(doneList)}</TabsContent>
        <TabsContent value="all" className="mt-6">{renderTaskGrid(filteredTasks)}</TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>タスク編集</DialogTitle></DialogHeader>
          {editingTask && <TaskForm initialTask={editingTask} onSubmit={handleUpdateTask} onCancel={() => setIsEditOpen(false)} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>このタスクを削除します。この操作は取り消せません。</AlertDialogDescription>
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
