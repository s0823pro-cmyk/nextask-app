
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings, Home, Trash2, Pencil } from "lucide-react"
import { toast } from "@/hooks/use-toast"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Client } from "@/lib/types"
import { saveClientFirestore, deleteClientFirestore, generateId } from "@/lib/task-service"
import { ClientForm } from "@/components/client-form"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"

// 並び替えのためのカラー順序定義
const COLOR_ORDER: Record<string, number> = {
  "bg-blue-500": 1,
  "bg-green-500": 2,
  "bg-orange-500": 3,
  "bg-red-500": 4,
  "bg-purple-500": 5,
  "bg-pink-500": 6,
}

export function SidebarNav() {
  const pathname = usePathname()
  const db = useFirestore()
  
  const clientsRef = useMemoFirebase(() => collection(db, 'clients'), [db]);
  const { data: rawClients = [] } = useCollection<Client>(clientsRef);
  
  // カラー順でソートされた取引先リスト
  const clients = React.useMemo(() => {
    return [...(rawClients || [])].sort((a, b) => {
      const orderA = COLOR_ORDER[a.color] || 99
      const orderB = COLOR_ORDER[b.color] || 99
      if (orderA !== orderB) return orderA - orderB
      return a.name.localeCompare(b.name, "ja")
    })
  }, [rawClients])
  
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [editingClient, setEditingClient] = React.useState<Client | null>(null)
  
  // 削除確認用の状態管理
  const [clientToDelete, setClientToDelete] = React.useState<{id: string, name: string} | null>(null)

  // ダイアログが完全に閉じてからデータをクリアするためのEffect
  React.useEffect(() => {
    if (!isSettingsOpen) {
      const timer = setTimeout(() => {
        setEditingClient(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isSettingsOpen])

  const handleAddOrUpdateClient = (data: { name: string; color: string }) => {
    if (editingClient) {
      const updatedClient: Client = {
        ...editingClient,
        name: data.name,
        color: data.color,
      }
      saveClientFirestore(db, updatedClient)
      setIsSettingsOpen(false)
      toast({ title: "取引先を更新しました" })
    } else {
      const newClient: Client = {
        id: generateId(),
        name: data.name,
        color: data.color,
        dedicatedUrlIdentifier: Math.random().toString(36).substr(2, 12),
      }
      saveClientFirestore(db, newClient)
      toast({ title: "取引先を追加しました", description: `${data.name} がリストに追加されました。` })
    }
  }

  const confirmDeleteClient = () => {
    if (clientToDelete) {
      deleteClientFirestore(db, clientToDelete.id)
      toast({ title: "取引先を削除しました", variant: "destructive" })
      setClientToDelete(null)
    }
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 flex items-center px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary-foreground">
            <div className="bg-primary p-1 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <span className="group-data-[collapsible=icon]:hidden">DailyFlow</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>一般</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>ホーム</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          
          <SidebarSeparator className="mx-2" />
          
          <SidebarGroup>
            <div className="flex items-center justify-between pr-2">
              <SidebarGroupLabel>取引先別タスク</SidebarGroupLabel>
            </div>
            <SidebarMenu>
              {clients.map((client) => (
                <SidebarMenuItem key={client.id}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname.includes(`/${client.id}`)}
                    tooltip={client.name}
                  >
                    <Link href={`/${client.id}`}>
                      <div className={`w-2 h-2 rounded-full ${client.color}`} />
                      <span>{client.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <SidebarMenuButton tooltip="設定">
                    <Settings className="h-4 w-4" />
                    <span>設定</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>設定・取引先管理</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">取引先一覧（カラー順）</h4>
                      <div className="space-y-2">
                        {clients.map((client) => (
                          <div key={client.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${client.color}`} />
                              <span className="text-sm">{client.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => setEditingClient(client)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setClientToDelete({id: client.id, name: client.name})}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {clients.length === 0 && (
                          <p className="text-sm text-muted-foreground">登録されている取引先はありません。</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">
                        {editingClient ? "取引先の編集" : "新規取引先の追加"}
                      </h4>
                      <ClientForm 
                        initialClient={editingClient || undefined}
                        onSubmit={handleAddOrUpdateClient}
                        onCancel={() => {
                          if (editingClient) setEditingClient(null)
                          else setIsSettingsOpen(false)
                        }}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>取引先を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{clientToDelete?.name}」を削除してもよろしいですか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteClient} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
