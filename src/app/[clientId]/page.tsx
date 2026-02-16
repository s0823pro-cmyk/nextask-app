"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react"
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
import { getTasks, saveTask, deleteTask, updateTaskStatus, getClients } from "@/lib/task-service"
import { TaskCard } from "@/components/task-card"
import { TaskForm } from "@/components/task-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ClientDashboard() {
  const { clientId } = useParams<{ clientId: string }>()
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [client, setClient] = React.useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)

  React.useEffect(() => {
    const clients = getClients()
    const currentClient = clients.find(c => c.id === clientId)
    setClient(currentClient || { id: clientId, name: clientId, color: "bg-gray-500" })
    loadTasks()
  }, [clientId])

  const loadTasks = () => {
    setTasks(getTasks(clientId))
  }

  const handleCreateTask = (data: Partial<Task>) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      clientId,
      title: data.title || "",
      description: data.description || "",
      status: data.status || "todo",
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      subtasks: [],
      createdAt: new Date().toISOString(),
    }
    saveTask(newTask)
    loadTasks()
    setIsCreateOpen(false)
    toast({ title: "タスクを作成しました", description: "新しいタスクがリストに追加されました。" })
  }

  const handleUpdateTask = (data: Partial<Task>) => {
    if (!editingTask) return
    const updatedTask: Task = { ...editingTask, ...data }
    saveTask(updatedTask)
    loadTasks()
    setEditingTask(null)
    toast({ title: "タスクを更新しました", description: "変更内容が保存されました。" })
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
    loadTasks()
    toast({ title: "タスクを削除しました", variant: "destructive" })
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus(taskId, status)
    loadTasks()
    toast({ title: "ステータスを更新しました" })
  }

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const todoTasks = filteredTasks.filter(t => t.status === 'todo')
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress')
  const doneTasks = filteredTasks.filter(t => t.status === 'done')

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full ${client?.color}`} />
            <span className="text-sm font-medium text-muted-foreground">取引先</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{client?.name} の業務フロー</h2>
          <p className="text-muted-foreground">タスクの進捗をリアルタイムで管理・更新します。</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
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
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <SlidersHorizontal className="mr-2 h-4 w-4" /> フィルター
        </Button>
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
          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Layout className="h-12 w-12 mb-4 opacity-20" />
              <p>タスクが見つかりませんでした。</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="todo" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todoTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in_progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="done" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doneTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
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

function Layout({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect width="7" height="11" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}
