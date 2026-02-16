"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, Circle, Clock, Calendar, LayoutDashboard, FileText } from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Task, TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusConfig = {
  todo: { label: "未着手", color: "bg-muted text-muted-foreground", icon: Circle },
  in_progress: { label: "進行中", color: "bg-blue-100 text-blue-700", icon: Clock },
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
  const todoTasks = tasks.filter(t => t.status === 'todo')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <LayoutDashboard className="h-6 w-6" />
            <span className="font-bold text-xl">DailyFlow Portal</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">業務進捗ダッシュボード</h1>
          <p className="text-muted-foreground">リアルタイムの作業進捗をご確認いただけます。</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all">すべて ({tasks.length})</TabsTrigger>
            <TabsTrigger value="todo">未着手 ({todoTasks.length})</TabsTrigger>
            <TabsTrigger value="in_progress">進行中 ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="done">完了 ({doneTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <PublicTaskCard key={task.id} task={task} />
              ))}
            </div>
            {tasks.length === 0 && <EmptyState />}
          </TabsContent>
          <TabsContent value="todo" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todoTasks.map((task) => <PublicTaskCard key={task.id} task={task} />)}
            </div>
            {todoTasks.length === 0 && <EmptyState />}
          </TabsContent>
          <TabsContent value="in_progress" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressTasks.map((task) => <PublicTaskCard key={task.id} task={task} />)}
            </div>
            {inProgressTasks.length === 0 && <EmptyState />}
          </TabsContent>
          <TabsContent value="done" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doneTasks.map((task) => <PublicTaskCard key={task.id} task={task} />)}
            </div>
            {doneTasks.length === 0 && <EmptyState />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function PublicTaskCard({ task }: { task: Task }) {
  const { label, color, icon: StatusIcon } = statusConfig[task.status]
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done'

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="p-4 pb-2">
        <Badge variant="outline" className={cn("mb-2 font-medium", color)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {label}
        </Badge>
        <CardTitle className="text-lg line-clamp-1">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[3rem]">
          {task.description || "詳細説明はありません。"}
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 text-xs font-medium">
             <div className="flex items-center text-muted-foreground">
              <FileText className="w-3 h-3 mr-1" />
              受付: {task.receptionDate ? format(new Date(task.receptionDate), "yyyy/MM/dd") : "-"}
            </div>
            <div className={cn(
              "flex items-center px-2 py-1 rounded-md",
              isOverdue ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
            )}>
              <Calendar className="w-3 h-3 mr-1" />
              期日: {format(new Date(task.dueDate), "yyyy/MM/dd")}
            </div>
          </div>
          <div className="text-muted-foreground italic text-[10px]">
            最終更新: {format(new Date(task.updatedAt), "HH:mm")}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24 bg-muted/20 rounded-xl border border-dashed">
      <p className="text-muted-foreground">表示できるタスクがありません。</p>
    </div>
  )
}
