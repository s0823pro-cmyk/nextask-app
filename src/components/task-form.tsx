"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileText, X, Plus } from "lucide-react"
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
import { Task, TaskPdf, Client } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  clientId: z.string().min(1, { message: "取引先を選択してください" }),
  title: z.string().min(2, { message: "タイトルは2文字以上で入力してください" }),
  description: z.string(),
  constructionType: z.string().optional(),
  status: z.enum(["in_progress", "pending", "done", "awaiting_payment"]),
  receptionDate: z.string(),
  dueDate: z.string(),
  pdfs: z.array(z.object({
    name: z.string(),
    data: z.string()
  })).max(3, { message: "PDFは最大3つまでです" }),
})

interface TaskFormProps {
  initialTask?: Task
  fixedClientId?: string
  clients?: Client[]
  onSubmit: (data: Partial<Task>) => void
  onCancel: () => void
}

export function TaskForm({ initialTask, fixedClientId, clients, onSubmit, onCancel }: TaskFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: fixedClientId || initialTask?.clientId || "",
      title: initialTask?.title || "",
      description: initialTask?.description || "",
      constructionType: initialTask?.constructionType || "",
      status: initialTask?.status === "todo" ? "in_progress" : (initialTask?.status || "in_progress"),
      receptionDate: initialTask?.receptionDate || format(new Date(), "yyyy-MM-dd"),
      dueDate: initialTask?.dueDate || format(new Date(), "yyyy-MM-dd"),
      pdfs: initialTask?.pdfs || [],
    },
  })

  const currentPdfs = form.watch("pdfs")

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newPdfs: TaskPdf[] = [...currentPdfs]
    const remainingSlots = 3 - currentPdfs.length

    if (remainingSlots <= 0) {
      toast({ title: "上限に達しました", description: "PDFは3つまでしか追加できません。", variant: "destructive" })
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    for (const file of filesToProcess) {
      if (file.type !== "application/pdf") {
        toast({ title: "エラー", description: `${file.name} はPDFではありません。`, variant: "destructive" })
        continue
      }

      const reader = new FileReader()
      const promise = new Promise<TaskPdf>((resolve) => {
        reader.onload = () => {
          resolve({
            name: file.name,
            data: reader.result as string
          })
        }
      })
      reader.readAsDataURL(file)
      const pdf = await promise
      newPdfs.push(pdf)
    }

    form.setValue("pdfs", newPdfs)
    if (fileInputRef.current) fileInputRef.current.value = ""
    toast({ title: "PDFを追加しました" })
  }

  const removePdf = (index: number) => {
    const updatedPdfs = currentPdfs.filter((_, i) => i !== index)
    form.setValue("pdfs", updatedPdfs)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))} className="space-y-5 md:space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <FormLabel className="text-sm font-semibold">添付資料</FormLabel>
            {currentPdfs.length < 3 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
              >
                <Plus className="mr-2 h-3 w-3" />
                PDFを追加 ({currentPdfs.length}/3)
              </Button>
            )}
            <input
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2">
            {currentPdfs.map((pdf, index) => (
              <div key={index} className="flex items-center justify-between gap-2 bg-muted p-2 rounded-md text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{pdf.name}</span>
                </div>
                <button type="button" onClick={() => removePdf(index)} className="text-muted-foreground hover:text-destructive p-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {clients && !fixedClientId && (
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">取引先</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="取引先を選択してください" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${client.color}`} />
                          {client.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">タスク名</FormLabel>
              <FormControl>
                <Input placeholder="例: 原状回復工事の開始" {...field} className="text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="constructionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">工事内容</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger className="border-muted-foreground/20 text-sm">
                    <SelectValue placeholder="工事内容を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="原状回復工事">原状回復工事</SelectItem>
                  <SelectItem value="入居中工事">入居中工事</SelectItem>
                  <SelectItem value="共用部工事">共用部工事</SelectItem>
                  <SelectItem value="保険案件">保険案件</SelectItem>
                </SelectContent>
              </Select>
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
                  className="min-h-[100px] md:min-h-[120px] resize-none border-muted-foreground/20 focus:border-primary text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <FormField
            control={form.control}
            name="receptionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">受付日</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="text-sm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">期日</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="text-sm" />
                </FormControl>
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
                  <SelectTrigger className="border-muted-foreground/20 text-sm">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in_progress">進行中</SelectItem>
                  <SelectItem value="pending">保留</SelectItem>
                  <SelectItem value="awaiting_payment">入金待ち</SelectItem>
                  <SelectItem value="done">完了</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto px-6">
            キャンセル
          </Button>
          <Button type="submit" className="w-full sm:w-auto px-8 font-semibold shadow-md transition-all active:scale-95">
            保存する
          </Button>
        </div>
      </form>
    </Form>
  )
}
