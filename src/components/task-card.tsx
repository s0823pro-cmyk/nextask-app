
"use client"

import * as React from "react"
import { format, isValid, parseISO } from "date-fns"
import { Calendar, MoreVertical, CheckCircle2, Clock, FileText, Paperclip, HardHat, Coins, Download, Eye } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Task, TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  pending: { label: "保留", color: "bg-orange-50 text-orange-600 border-orange-200", icon: Clock },
  awaiting_payment: { label: "入金待ち", color: "bg-amber-50 text-amber-600 border-amber-200", icon: Coins },
  done: { label: "完了", color: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle2 },
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const { label, color, icon: StatusIcon } = statusConfig[task.status] || statusConfig.in_progress
  
  const formatDateSafe = (dateStr: string | undefined) => {
    if (!dateStr || !mounted) return "-"
    try {
      const date = parseISO(dateStr)
      return isValid(date) ? format(date, "yyyy/MM/dd") : "-"
    } catch {
      return "-"
    }
  }

  const isOverdue = React.useMemo(() => {
    if (!mounted || task.status === 'done' || task.status === 'awaiting_payment' || !task.dueDate) return false
    try {
      const date = parseISO(task.dueDate)
      return isValid(date) && date.getTime() < new Date().setHours(0,0,0,0)
    } catch {
      return false
    }
  }, [task.dueDate, task.status, mounted])

  // PDF同期閲覧ロジック
  const handlePdfAction = (data: string) => {
    try {
      const parts = data.split(',');
      if (parts.length < 2) return;
      
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error("PDF viewing error:", err);
    }
  }

  const pdfCount = task.pdfs?.length || 0

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden relative">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", 
        task.status === 'done' ? "bg-primary" : task.status === 'pending' ? "bg-orange-500" : task.status === 'awaiting_payment' ? "bg-amber-500" : "bg-blue-500"
      )} />
      
      <CardHeader className="p-4 pb-2 space-y-0 flex flex-row items-start justify-between">
        <div className="flex-1 mr-2 pl-2">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {label}
            </Badge>
            {task.constructionType && (
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 border-none">
                <HardHat className="w-2.5 h-2.5 mr-1" />
                {task.constructionType}
              </Badge>
            )}
            {pdfCount > 0 && (
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold bg-muted text-muted-foreground border-none cursor-pointer" onClick={() => task.pdfs?.[0] && handlePdfAction(task.pdfs[0].data)}>
                <Paperclip className="w-2.5 h-2.5 mr-1" />
                PDF {pdfCount}
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
          <DropdownMenuContent align="end" className="w-56 shadow-xl">
            <DropdownMenuItem onClick={() => onEdit(task)}>編集</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] text-muted-foreground">ステータス</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>進行中に変更</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'pending')}>保留に変更</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'awaiting_payment')}>入金待ちに変更</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')}>完了に変更</DropdownMenuItem>
            
            {pdfCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] text-muted-foreground">添付資料 (閲覧)</DropdownMenuLabel>
                {task.pdfs?.map((pdf, idx) => (
                  <DropdownMenuItem key={idx} onClick={() => handlePdfAction(pdf.data)} className="font-semibold text-primary">
                    <Eye className="w-3 h-3 mr-2" /> {pdf.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            
            <DropdownMenuSeparator />
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
              <span>受付: {formatDateSafe(task.receptionDate)}</span>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded",
              isOverdue ? "text-destructive bg-destructive/5 font-bold" : "text-muted-foreground"
            )}>
              <Calendar className="w-3.5 h-3.5 opacity-50" />
              <span>期日: {formatDateSafe(task.dueDate)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
