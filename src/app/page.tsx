
"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, Clock, Layout, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Client, Task } from "@/lib/types"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"

export default function Home() {
  const db = useFirestore()

  // 取引先一覧の取得
  const clientsRef = useMemoFirebase(() => collection(db, 'clients'), [db]);
  const { data: clients = [] } = useCollection<Client>(clientsRef);

  // 全タスクの取得（統計用）
  const tasksRef = useMemoFirebase(() => collection(db, 'tasks'), [db]);
  const { data: allTasks = [] } = useCollection<Task>(tasksRef);

  const stats = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayTasksCount = (allTasks || []).filter(t => t.dueDate === today && t.status !== 'done').length
    const completedTotalCount = (allTasks || []).filter(t => t.status === 'done').length
    const totalTasksCount = (allTasks || []).length
    const rate = totalTasksCount > 0 ? Math.round((completedTotalCount / totalTasksCount) * 100) : 0

    return {
      todayTasks: todayTasksCount,
      completedTotal: completedTotalCount,
      clientCount: (clients || []).length,
      completionRate: rate
    }
  }, [allTasks, clients])

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">DailyFlowへようこそ</h1>
        <p className="text-muted-foreground">
          業務効率を最大化するタスク管理プラットフォーム。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日のタスク</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTasks}</div>
            <p className="text-xs text-muted-foreground">期日が今日の未完了タスク</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了済み</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTotal}</div>
            <p className="text-xs text-muted-foreground">全取引先の合計</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登録取引先</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientCount}</div>
            <p className="text-xs text-muted-foreground">現在管理中の企業数</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">タスク完了率</CardTitle>
            <Layout className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">全体の進捗状況</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
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
      </div>
    </div>
  )
}
