
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Sparkles, Loader2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Task, TaskStatus } from "@/lib/types"
import { taskDescriptionEnhancement } from "@/ai/flows/task-description-enhancement"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(2, { message: "タイトルは2文字以上で入力してください" }),
  description: z.string(),
  status: z.enum(["todo", "in_progress", "done"]),
  receptionDate: z.string(),
  dueDate: z.string(),
})

interface TaskFormProps {
  initialTask?: Task
  onSubmit: (data: Partial<Task>) => void
  onCancel: () => void
}

export function TaskForm({ initialTask, onSubmit, onCancel }: TaskFormProps) {
  const [isEnhancing, setIsEnhancing] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialTask?.title || "",
      description: initialTask?.description || "",
      status: initialTask?.status || "todo",
      receptionDate: initialTask?.receptionDate || format(new Date(), "yyyy-MM-dd"),
      dueDate: initialTask?.dueDate || format(new Date(), "yyyy-MM-dd"),
    },
  })

  const handleEnhance = async () => {
    const title = form.getValues("title")
    if (!title) return

    setIsEnhancing(true)
    try {
      const result = await taskDescriptionEnhancement({ briefDescription: title })
      form.setValue("description", result.detailedDescription)
      if (result.subtasks && result.subtasks.length > 0) {
        const subtasksText = result.subtasks.map(s => `• ${s}`).join('\n')
        form.setValue("description", `${result.detailedDescription}\n\n【推奨サブタスク】\n${subtasksText}`)
      }
    } catch (error) {
      console.error("AI enhancement failed", error)
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">タスク名</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="例: 月次報告書の作成" className="pr-24" {...field} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 text-primary hover:text-primary/80 h-8"
                    onClick={handleEnhance}
                    disabled={!field.value || isEnhancing}
                  >
                    {isEnhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                    AI提案
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">詳細説明</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="タスクの詳細を入力してください..." 
                  className="min-h-[120px] resize-none border-muted-foreground/20 focus:border-primary" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="receptionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-2 text-sm font-semibold">受付日</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal border-muted-foreground/20 hover:border-primary transition-colors",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary opacity-70" />
                        {field.value ? (
                          format(new Date(field.value), "yyyy/MM/dd")
                        ) : (
                          <span>日付を選択</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 shadow-xl border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                      className="rounded-md border-none"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-2 text-sm font-semibold">期日</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal border-muted-foreground/20 hover:border-primary transition-colors",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary opacity-70" />
                        {field.value ? (
                          format(new Date(field.value), "yyyy/MM/dd")
                        ) : (
                          <span>日付を選択</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 shadow-xl border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                      className="rounded-md border-none"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">ステータス</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-muted-foreground/20">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="todo">未着手</SelectItem>
                  <SelectItem value="in_progress">進行中</SelectItem>
                  <SelectItem value="done">完了</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} className="px-6">
            キャンセル
          </Button>
          <Button type="submit" className="px-8 font-semibold shadow-md transition-all active:scale-95">
            保存する
          </Button>
        </div>
      </form>
    </Form>
  )
}
