"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings, Home, Trash2, Pencil, Building2, Users } from "lucide-react"
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
import { Client, ClientType } from "@/lib/types"
import { saveClientFirestore, deleteClientFirestore, generateId } from "@/lib/task-service"
import { ClientForm } from "@/components/client-form"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"

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
  
  const clients = React.useMemo(() => {
    return [...(rawClients || [])].sort((a, b) => {
      const orderA = COLOR_ORDER[a.color] || 99
      const orderB = COLOR_ORDER[b.color] || 99
      if (orderA !== orderB) return orderA - orderB
      return a.name.localeCompare(b.name, "ja")
    })
  }, [rawClients])

  const primeClients = React.useMemo(() => clients.filter(c => c.clientType === 'prime'), [clients]);
  const subClients = React.useMemo(() => clients.filter(c => !c.clientType || c.clientType === 'sub'), [clients]);
  
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [editingClient, setEditingClient] = React.useState<Client | null>(null)
  const [clientToDelete, setClientToDelete] = React.useState<{id: string, name: string} | null>(null)

  const handleAddOrUpdateClient = (data: { name: string; color: string; clientType: ClientType }) => {
    if (editingClient) {
      saveClientFirestore(db, { ...editingClient, ...data });
      setIsSettingsOpen(false);
      setEditingClient(null);
      toast({ title: "更新しました" });
    } else {
      const newClient: Client = {
        id: generateId(),
        name: data.name,
        color: data.color,
        clientType: data.clientType,
        dedicatedUrlIdentifier: Math.random().toString(36).substr(2, 12),
      }
      saveClientFirestore(db, newClient)
      toast({ title: "追加しました" })
    }
  }

  const renderClientList = (clientList: Client[]) => (
    <SidebarMenu>
      {clientList.map((client) => (
        <SidebarMenuItem key={client.id}>
          <SidebarMenuButton asChild isActive={pathname.includes(`/${client.id}`)} tooltip={client.name}>
            <Link href={`/${client.id}`}>
              <div className={`w-2 h-2 rounded-full ${client.color}`} />
              <span className="flex-1 truncate">{client.name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 flex items-center px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary-foreground">
            <div className="bg-primary p-1 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <span className="group-data-[collapsible=icon]:hidden">NexTask</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/"><Home className="h-4 w-4" /><span>ホーム</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator className="mx-2" />
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /> 元請け</SidebarGroupLabel>
            {renderClientList(primeClients)}
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-1.5"><Users className="h-3 w-3" /> 下請け</SidebarGroupLabel>
            {renderClientList(subClients)}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <SidebarMenuButton tooltip="設定"><Settings className="h-4 w-4" /><span>設定</span></SidebarMenuButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader><DialogTitle>取引先管理</DialogTitle></DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {clients.map((client) => (
                        <div key={client.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-3 h-3 rounded-full ${client.color} shrink-0`} />
                            <span className="text-sm font-medium truncate">{client.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingClient(client)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setClientToDelete({id: client.id, name: client.name})}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <ClientForm 
                      initialClient={editingClient || undefined}
                      onSubmit={handleAddOrUpdateClient}
                      onCancel={() => setEditingClient(null)}
                    />
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
            <AlertDialogDescription>「{clientToDelete?.name}」を削除します。操作は取り消せません。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (clientToDelete) deleteClientFirestore(db, clientToDelete.id); setClientToDelete(null); }} className="bg-destructive text-destructive-foreground">削除する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
