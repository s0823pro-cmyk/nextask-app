
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Client } from "@/lib/types"

const colors = [
  { label: "ブルー", value: "bg-blue-500" },
  { label: "グリーン", value: "bg-green-500" },
  { label: "パープル", value: "bg-purple-500" },
  { label: "レッド", value: "bg-red-500" },
  { label: "オレンジ", value: "bg-orange-500" },
  { label: "ピンク", value: "bg-pink-500" },
]

const formSchema = z.object({
  name: z.string().min(1, { message: "取引先名を入力してください" }),
  color: z.string().min(1, { message: "色を選択してください" }),
})

interface ClientFormProps {
  initialClient?: Client
  onSubmit: (data: { name: string; color: string }) => void
  onCancel: () => void
}

export function ClientForm({ initialClient, onSubmit, onCancel }: ClientFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialClient?.name || "",
      color: initialClient?.color || "bg-blue-500",
    },
  })

  // Reset form when initialClient changes (e.g. when switching from add to edit or between different clients)
  React.useEffect(() => {
    if (initialClient) {
      form.reset({
        name: initialClient.name,
        color: initialClient.color,
      })
    } else {
      form.reset({
        name: "",
        color: "bg-blue-500",
      })
    }
  }, [initialClient, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>取引先名</FormLabel>
              <FormControl>
                <Input placeholder="例: 株式会社サンプル" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>テーマカラー</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="色を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color.value}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            {initialClient ? "閉じる" : "キャンセル"}
          </Button>
          <Button type="submit">{initialClient ? "更新" : "保存"}</Button>
        </div>
      </form>
    </Form>
  )
}
