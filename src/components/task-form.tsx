
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, FileUp, FileText, X } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
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
import { Task } from "@/lib/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  title: z.string().min(2, { message: "タイトルは2文字以上で入力してください" }),
  description: z.string(),
  status: z.enum(["in_progress", "pending", "done"]),
  receptionDate: z.string(),
  dueDate: z.string(),
  pdfName: z.string().optional(),
  pdfData: z.string().optional(),
})

interface TaskFormProps {
  initialTask?: Task
  onSubmit: (data: Partial<Task>) => void
  onCancel: () => void
}

export function TaskForm({ initialTask, onSubmit, onCancel }: TaskFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialTask?.title || "",
      description: initialTask?.description || "",
      status: initialTask?.status === "todo" ? "in_progress" : (initialTask?.status || "in_progress"),
      receptionDate: initialTask?.receptionDate || format(new Date(), "yyyy-MM-dd"),
      dueDate: initialTask?.dueDate || format(new Date(), "yyyy-MM-dd"),
      pdfName: initialTask?.pdfName || "",
      pdfData: initialTask?.pdfData || "",
    },
  })

  const pdfName = form.watch("pdfName")

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast({ title: "エラー", description: "PDFファイルを選択してください。", variant: "destructive" })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      form.setValue("pdfData", base64)
      form.setValue("pdfName", file.name)
      toast({ title: "PDFを選択しました", description: file.name })
    }
    reader.readAsDataURL(file)
  }

  const removePdf = () => {
    form.setValue("pdfData", "")
    form.setValue("pdfName", "")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))} className="space-y-6">
        <div className="flex items-center justify-between">
          <FormLabel className="text-sm font-semibold">基本情報</FormLabel>
          <div>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {!pdfName ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
              >
                <FileUp className="mr-2 h-3 w-3" />
                PDFファイルを選択
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-muted p-1 px-2 rounded-md text-xs">
                <FileText className="h-3 w-3 text-primary" />
                <span className="max-w-[150px] truncate">{pdfName}</span>
                <button type="button" onClick={removePdf} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">タスク名</FormLabel>
              <FormControl>
                <Input placeholder="例: 月次報告書の作成" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger className="border-muted-foreground/20">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in_progress">進行中</SelectItem>
                  <SelectItem value="pending">保留</SelectItem>
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
