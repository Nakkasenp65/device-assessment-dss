"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PATH_ICONS } from "@/constants/icons";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร",
  }),
  code: z.string().min(2, {
    message: "รหัสต้องมีความยาวอย่างน้อย 2 ตัวอักษร",
  }),
  icon: z.string().optional(),
  description_template: z.string().min(10, {
    message: "คำอธิบายต้องมีความยาวอย่างน้อย 10 ตัวอักษร",
  }),
  weight_physical: z.preprocess(
    (val) => (isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0).max(1),
  ),
  weight_functional: z.preprocess(
    (val) => (isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0).max(1),
  ),
  weight_age: z.preprocess(
    (val) => (isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0).max(1),
  ),
});

interface PathFormProps {
  initialData?: any;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading?: boolean;
  hideWeights?: boolean;
  submitLabel?: string;
}

export function PathForm({
  initialData,
  onSubmit,
  isLoading,
  hideWeights = false,
  submitLabel = "บันทึกข้อมูล",
}: PathFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      code: "",
      description_template: "",
      weight_physical: 0,
      weight_functional: 0,
      weight_age: 0,
      icon: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        code: initialData.code || "",
        description_template: initialData.description_template || "",
        weight_physical: Number(initialData.weight_physical || 0),
        weight_functional: Number(initialData.weight_functional || 0),
        weight_age: Number(initialData.weight_age || 0),
        icon: initialData.icon || "",
      });
    } else {
      form.reset({
        name: "",
        code: "",
        description_template: "",
        weight_physical: 0,
        weight_functional: 0,
        weight_age: 0,
        icon: "",
      });
    }
  }, [initialData, form]);

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">ชื่อเส้นทาง</FormLabel>
                <FormControl>
                  <Input
                    placeholder="เช่น ขายออก"
                    {...field}
                    className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">รหัส</FormLabel>
                <FormControl>
                  <Input
                    placeholder="เช่น SELL"
                    {...field}
                    className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">ไอคอน</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50">
                    <SelectValue placeholder="เลือกไอคอน" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {PATH_ICONS.map((icon) => (
                    <SelectItem
                      key={icon.value}
                      value={icon.value}
                      className="focus:bg-zinc-800 focus:text-white cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <DynamicIcon name={icon.value} className="h-4 w-4" />
                        <span>{icon.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description_template"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">แม่แบบคำอธิบาย</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="คำอธิบายผลลัพธ์..."
                  {...field}
                  className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50 min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className={hideWeights ? "hidden" : "grid grid-cols-3 gap-4"}>
          <FormField
            control={form.control}
            name="weight_physical"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300 text-xs">
                  นน. กายภาพ
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    {...field}
                    className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight_functional"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300 text-xs">
                  นน. ฟังก์ชัน
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    {...field}
                    className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight_age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300 text-xs">
                  นน. อายุ
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    {...field}
                    className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 text-white w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
