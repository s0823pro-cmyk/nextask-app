import Link from "next/link"
import { ArrowRight, CheckCircle, Clock, Layout, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">DailyFlowへようこそ</h1>
        <p className="text-muted-foreground">
          業務効率を最大化するタスク管理プラットフォーム。AIがあなたの作業をサポートします。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日のタスク</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">残り3つの重要タスク</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了済み</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">今週の合計</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登録取引先</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">管理可能なクライアント</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">稼働時間</CardTitle>
            <Layout className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">前月比 +2.4%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/50">
          <CardHeader>
            <CardTitle>取引先別ダッシュボード</CardTitle>
            <CardDescription>専用のURLで個別にタスク管理が可能です。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "acme-inc", name: "株式会社アクメ", color: "bg-blue-500", count: 8 },
              { id: "global-corp", name: "グローバル合同会社", color: "bg-green-500", count: 5 },
              { id: "future-tech", name: "フューチャー・テック", color: "bg-purple-500", count: 12 },
            ].map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${client.color}`} />
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.count}件のタスク</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/${client.id}`}>
                    開く <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-border/50">
          <CardHeader>
            <CardTitle>AIアシスタント機能</CardTitle>
            <CardDescription>タスクの詳細はAIが提案します。</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-4">
              DailyFlowは最新のAIを搭載。短いタイトルを入力するだけで、具体的な手順や必要なサブタスクを瞬時に作成します。
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 text-primary p-1 rounded">✨</div>
                <span>詳細説明の自動生成</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 text-primary p-1 rounded">📋</div>
                <span>チェックリストの提案</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 text-primary p-1 rounded">📅</div>
                <span>期日の最適化アドバイス</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
