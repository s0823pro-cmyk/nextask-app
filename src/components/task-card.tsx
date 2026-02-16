"use client"

import { format } from "date-fns"
import { Calendar, MoreVertical, CheckCircle2, Circle, Clock, FileText } from "lucide-react"

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
  todo: { label: "未着手", color: "bg-muted text-muted-foreground border-transparent", icon: Circle },
  in_progress: { label: "進行中", color: "bg-blue-100 text-blue-700 border-transparent", icon: Clock },
  done: { label: "完了", color: "bg-primary/10 text-primary border-transparent", icon: CheckCircle2 },
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const { label, color, icon: StatusIcon } = statusConfig[task.status]
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done'

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 border-border/50">
      <CardHeader className="p-4 pb-2 space-y-0 flex flex-row items-start justify-between">
        <div className="flex-1 mr-2">
          <Badge variant="outline" className={cn("mb-2 font-medium capitalize", color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {label}
          </Badge>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {task.title}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>編集</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')}>未着手に変更</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>進行中に変更</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')}>完了に変更</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
          {task.description || "説明なし"}
        </p>
        <div className="space-y-2">
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
          {task.subtasks?.length > 0 && (
            <div className="text-[10px] text-muted-foreground">
              {task.subtasks.length} サブタスク
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
