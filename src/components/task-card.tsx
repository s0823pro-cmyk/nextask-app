
"use client"

import { format } from "date-fns"
import { Calendar, MoreVertical, CheckCircle2, Clock, FileText, Paperclip } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Task, TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

const statusConfig = {
  todo: { label: "進行中", color: "bg-blue-50 text-blue-600 border-blue-200", icon: Clock },
  in_progress: { label: "進行中", color: "bg-blue-50 text-blue-600 border-blue-200", icon: Clock },
  done: { label: "完了", color: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle2 },
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const { label, color, icon: StatusIcon } = statusConfig[task.status] || statusConfig.in_progress
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done'

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden relative">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", 
        task.status === 'done' ? "bg-primary" : "bg-blue-500"
      )} />
      
      <CardHeader className="p-4 pb-2 space-y-0 flex flex-row items-start justify-between">
        <div className="flex-1 mr-2 pl-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {label}
            </Badge>
            {task.pdfData && (
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold bg-muted text-muted-foreground border-none">
                <Paperclip className="w-2.5 h-2.5 mr-1" />
                PDF
              </Badge>
            )}
          </div>
          <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {task.title}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-xl">
            <DropdownMenuItem onClick={() => onEdit(task)}>編集</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>進行中に変更</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')}>完了に変更</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => onDelete(task.id)}>
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pl-6">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-[2rem] leading-relaxed">
          {task.description || "説明なし"}
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 opacity-50" />
              <span>受付: {task.receptionDate ? format(new Date(task.receptionDate), "yyyy/MM/dd") : "-"}</span>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded",
              isOverdue ? "text-destructive bg-destructive/5 font-bold" : "text-muted-foreground"
            )}>
              <Calendar className="w-3.5 h-3.5 opacity-50" />
              <span>期日: {format(new Date(task.dueDate), "yyyy/MM/dd")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
