"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Settings, Plus, Home } from "lucide-react"
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
import { getClients, saveClient } from "@/lib/task-service"
import { ClientForm } from "@/components/client-form"

export function SidebarNav() {
  const pathname = usePathname()
  const [clients, setClients] = React.useState<Client[]>([])
  const [isClientDialogOpen, setIsClientDialogOpen] = React.useState(false)

  React.useEffect(() => {
    setClients(getClients())
  }, [])

  const handleAddClient = (data: { name: string; color: string }) => {
    const newClient: Client = {
      id: data.name.toLowerCase().replace(/\s+/g, '-'),
      name: data.name,
      color: data.color,
    }
    saveClient(newClient)
    setClients(getClients())
    setIsClientDialogOpen(false)
    toast({ title: "取引先を追加しました", description: `${data.name} がリストに追加されました。` })
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
            <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
              <DialogTrigger asChild>
                <SidebarMenuButton tooltip="取引先の追加・管理">
                  <Settings className="h-4 w-4" />
                  <span>取引先の追加</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新規取引先の追加</DialogTitle>
                </DialogHeader>
                <ClientForm 
                  onSubmit={handleAddClient}
                  onCancel={() => setIsClientDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
