
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
import { Client } from "@/lib/types"
import { saveClientFirestore, deleteClientFirestore, generateId } from "@/lib/task-service"
import { ClientForm } from "@/components/client-form"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"

export function SidebarNav() {
  const pathname = usePathname()
  const db = useFirestore()
  
  const clientsRef = useMemoFirebase(() => collection(db, 'clients'), [db]);
  const { data: clients = [] } = useCollection<Client>(clientsRef);
  
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [editingClient, setEditingClient] = React.useState<Client | null>(null)

  const handleAddOrUpdateClient = (data: { name: string; color: string }) => {
    if (editingClient) {
      const updatedClient: Client = {
        ...editingClient,
        name: data.name,
        color: data.color,
      }
      setEditingClient(null)
      saveClientFirestore(db, updatedClient)
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

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (confirm(`${clientName} を削除してもよろしいですか？`)) {
      deleteClientFirestore(db, clientId)
      toast({ title: "取引先を削除しました", variant: "destructive" })
    }
  }

  return (
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
            {(clients || []).map((client) => (
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
            <Dialog open={isSettingsOpen} onOpenChange={(open) => {
              setIsSettingsOpen(open)
              if (!open) setEditingClient(null)
            }}>
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
                    <h4 className="text-sm font-medium">取引先一覧</h4>
                    <div className="space-y-2">
                      {(clients || []).map((client) => (
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
                              onClick={() => handleDeleteClient(client.id, client.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {clients?.length === 0 && (
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
  )
}
