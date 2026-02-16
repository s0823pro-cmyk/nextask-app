"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Settings, Plus, Home } from "lucide-react"

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

const mainNav = [
  { title: "ダッシュボード", icon: LayoutDashboard, url: "/" },
  { title: "取引先一覧", icon: Users, url: "/clients" },
]

// Sample clients that could be fetched from a database
const clients = [
  { id: "acme-inc", name: "株式会社アクメ", color: "bg-blue-500" },
  { id: "global-corp", name: "グローバル合同会社", color: "bg-green-500" },
  { id: "future-tech", name: "フューチャー・テック", color: "bg-purple-500" },
]

export function SidebarNav() {
  const pathname = usePathname()

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
          <SidebarGroupLabel>取引先別タスク</SidebarGroupLabel>
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
            <SidebarMenuButton>
              <Settings className="h-4 w-4" />
              <span>設定</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
