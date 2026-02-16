"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Plus, Search, SlidersHorizontal, Share2, Copy, Check } from "lucide-react"
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
  const [copied, setCopied] = React.useState(false)

  // 取引先情報の取得
  const clientRef = useMemoFirebase(() => doc(db, 'clients', clientId), [db, clientId]);
  const { data: client } = useDoc<Client>(clientRef);

  // タスク一覧の取得
  const tasksQuery = useMemoFirebase(() => {
    return query(collection(db, 'tasks'), where('clientId', '==', clientId));
  }, [db, clientId]);
  const { data: tasks = [], isLoading } = useCollection<Task>(tasksQuery);

  const handleCreateTask = (data: Partial<Task>) => {
    if (!client) return;
    const now = new Date().toISOString();
    const newTask: Task = {
      id: generateId(),
      clientId,
      title: data.title || "",
      description: data.description || "",
      status: data.status || "todo",
      dueDate: data.dueDate || now.split('T')[0],
      subtasks: [],
      createdAt: now,
      updatedAt: now,
    }
    saveTaskWithSync(db, newTask, client.dedicatedUrlIdentifier);
    setIsCreateOpen(false);
    toast({ title: "タスクを作成しました" });
  }

  const handleUpdateTask = (data: Partial<Task>) => {
    if (!editingTask || !client) return;
    const updatedTask: Task = { 
      ...editingTask, 
      ...data, 
      updatedAt: new Date().toISOString() 
    }
    saveTaskWithSync(db, updatedTask, client.dedicatedUrlIdentifier);
    setEditingTask(null);
    toast({ title: "タスクを更新しました" });
  }

  const handleDeleteTask = (taskId: string) => {
    if (!client) return;
    deleteTaskWithSync(db, taskId, client.dedicatedUrlIdentifier);
    toast({ title: "タスクを削除しました", variant: "destructive" });
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const task = tasks?.find(t => t.id === taskId);
    if (task && client) {
      const updatedTask = { ...task, status, updatedAt: new Date().toISOString() };
      saveTaskWithSync(db, updatedTask, client.dedicatedUrlIdentifier);
      toast({ title: "ステータスを更新しました" });
    }
  }

  const copyShareLink = () => {
    if (!client) return;
    const url = `${window.location.origin}/view/${client.dedicatedUrlIdentifier}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "共有URLをコピーしました" });
  }

  const filteredTasks = (tasks || []).filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const todoTasks = filteredTasks.filter(t => t.status === 'todo')
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress')
  const doneTasks = filteredTasks.filter(t => t.status === 'done')

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full ${client?.color || 'bg-gray-400'}`} />
            <span className="text-sm font-medium text-muted-foreground">取引先</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {client?.name || '読み込み中...'} の業務フロー
          </h2>
          <p className="text-muted-foreground">タスクの進捗をリアルタイムで管理・更新します。</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyShareLink} className="h-10">
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
            共有URLをコピー
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> 新規タスク
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
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
            placeholder="タスクを検索..." 
            className="pl-9 bg-white border-border/50" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="all">すべて ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="todo">未着手 ({todoTasks.length})</TabsTrigger>
          <TabsTrigger value="in_progress">進行中 ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="done">完了 ({doneTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          {!isLoading && filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Plus className="h-12 w-12 mb-4 opacity-20" />
              <p>タスクが見つかりませんでした。</p>
            </div>
          )}
        </TabsContent>
        
        {/* ... other TabsContent remain similar, just filtered ... */}
        <TabsContent value="todo" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todoTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={setEditingTask} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="in_progress" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={setEditingTask} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="done" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doneTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={setEditingTask} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>タスクを編集</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm 
              initialTask={editingTask} 
              onSubmit={handleUpdateTask} 
              onCancel={() => setEditingTask(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
