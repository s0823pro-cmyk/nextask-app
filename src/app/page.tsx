
"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, Clock, Layout, Users, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Client, Task, TaskStatus } from "@/lib/types"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { TaskCard } from "@/components/task-card"
import { toast } from "@/hooks/use-toast"
import { saveTaskWithSync, deleteTaskWithSync } from "@/lib/task-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/task-form"

export default function Home() {
  const db = useFirestore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  // 取引先一覧の取得
  const clientsRef = useMemoFirebase(() => collection(db, 'clients'), [db]);
  const { data: clients = [] } = useCollection<Client>(clientsRef);

  // 全タスクの取得（統計および検索用）
  const tasksRef = useMemoFirebase(() => collection(db, 'tasks'), [db]);
  const { data: allTasks = [], isLoading: isTasksLoading } = useCollection<Task>(tasksRef);

  const stats = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayTasksCount = (allTasks || []).filter(t => t.dueDate === today && t.status !== 'done').length

    return {
      todayTasks: todayTasksCount,
    }
  }, [allTasks])

  // 検索フィルタリングロジック
  const filteredTasks = React.useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return [];

    return (allTasks || []).filter(t => {
      // タイトルと説明の検索
      const matchText = t.title.toLowerCase().includes(searchLower) || 
                       t.description.toLowerCase().includes(searchLower);
      
      if (matchText) return true;

      // 日付の検索
      const normalizedSearch = searchLower.replace(/[\/\.]/g, '-');
      const dateParts = normalizedSearch.split('-');
      const paddedSearch = dateParts.map(part => {
        if (/^\d{1,2}$/.test(part)) {
          return part.padStart(2, '0');
        }
        return part;
      }).join('-');

      const matchDate = t.receptionDate?.includes(paddedSearch) || 
                       t.dueDate?.includes(paddedSearch) ||
                       t.receptionDate?.includes(normalizedSearch) ||
                       t.dueDate?.includes(normalizedSearch);

      return matchDate;
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
    const task = allTasks?.find(t => t.id === taskId);
    const client = clients?.find(c => c.id === task?.clientId);
    if (task && client) {
      deleteTaskWithSync(db, taskId, client.dedicatedUrlIdentifier);
      toast({ title: "タスクを削除しました", variant: "destructive" });
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

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">DailyFlowへようこそ</h1>
          <p className="text-muted-foreground">
            業務効率を最大化するタスク管理プラットフォーム。
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="全プロジェクトからタスクを検索 (名前、日付など)..." 
            className="pl-9 h-11 bg-white border-border/50 shadow-sm focus:ring-primary" 
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

      {!searchQuery && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日のタスク</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayTasks}</div>
              <p className="text-xs text-muted-foreground">全案件の今日の未完了数</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6">
        {searchQuery ? (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                検索結果: {filteredTasks.length}件
              </CardTitle>
              <CardDescription>
                すべての取引先から「{searchQuery}」に一致するタスクを表示しています。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                  <Search className="h-12 w-12 mb-4 opacity-20" />
                  <p>一致するタスクが見つかりませんでした。</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>取引先別ダッシュボード</CardTitle>
              <CardDescription>各取引先の専用ページでタスクを管理できます。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(clients || []).map((client) => {
                  const taskCount = (allTasks || []).filter(t => t.clientId === client.id).length
                  return (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${client.color}`} />
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{taskCount}件のタスク</p>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/${client.id}`}>
                          開く <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )
                })}
              </div>
              {(!clients || clients.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>取引先が登録されていません。</p>
                  <p className="text-xs mt-1">サイドバーの「設定」から追加してください。</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
    </div>
  )
}
