"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ClipboardList, Circle, AlertTriangle, Flame, ShieldAlert, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { AnswerGroupForm, answerGroupSchema } from "@/components/admin/AnswerGroupForm";
import api from "@/lib/api";
import { CONDITION_ICONS } from "@/constants/icons";
import { DynamicIcon } from "@/components/DynamicIcon";
import Link from "next/link";

const IMPACT_WEIGHT_OPTIONS = [
  {
    label: "น้อย (ผิวเผิน)",
    value: 1,
    icon: Circle,
    color: "text-zinc-400",
  },
  {
    label: "ปานกลาง (เล็กน้อย)",
    value: 3,
    icon: AlertTriangle,
    color: "text-yellow-400",
  },
  {
    label: "สูง (สำคัญ)",
    value: 5,
    icon: Flame,
    color: "text-orange-400",
  },
  {
    label: "วิกฤต (ร้ายแรง)",
    value: 10,
    icon: ShieldAlert,
    color: "text-red-400",
  },
] as const;

// Combined Schema
const conditionSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อเกณฑ์"),
  category_id: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  answer_type: z.enum(["choice", "text", "number"]),
  impact_weight: z.coerce.number().refine((v) => [1, 3, 5, 10].includes(v), {
    message: "ต้องเป็นหนึ่งใน: 1, 3, 5, 10",
  }),
  icon: z.string().optional(),
  answerGroup: answerGroupSchema,
});

type ConditionFormValues = z.infer<typeof conditionSchema>;

export default function CreateConditionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [existingGroups, setExistingGroups] = useState<{ id: number; name: string; answerOptions: any[] }[]>([]);

  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(conditionSchema) as any,
    defaultValues: {
      name: "",
      category_id: "",
      answer_type: "choice",
      impact_weight: 1,
      icon: "smartphone",
      answerGroup: {
        mode: "select",
        options: [],
      },
    },
  });

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsRes = await api.get("/answer-groups");
        setExistingGroups(groupsRes.data);

        try {
          const catRes = await api.get("/conditions/categories");
          setCategories(catRes.data.data);
        } catch (e) {
          console.warn("ใช้หมวดหมู่ตัวอย่าง");
          setCategories([
            { id: 1, name: "สภาพภายนอก" },
            { id: 2, name: "สภาพการใช้งาน" },
            { id: 3, name: "อายุและการใช้งาน" },
          ]);
        }
      } catch (error) {
        toast.error("โหลดข้อมูลเริ่มต้นไม่สำเร็จ");
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: ConditionFormValues) => {
    setLoading(true);
    try {
      const payload: any = {
        name: data.name,
        category_id: data.category_id,
        answer_type: data.answer_type,
        impact_weight: data.impact_weight,
      };

      if (data.answerGroup.mode === "select") {
        if (!data.answerGroup.selectedGroupId) {
          toast.error("กรุณาเลือกกลุ่มคำตอบ");
          setLoading(false);
          return;
        }
        payload.answer_group_id = data.answerGroup.selectedGroupId;
      } else {
        payload.new_answer_group = {
          name: data.answerGroup.newGroupName,
          options: data.answerGroup.options,
        };
      }

      await api.post("/conditions", payload);
      toast.success("สร้างเกณฑ์สภาพสำเร็จ");
      router.push("/admin/conditions");
    } catch (error) {
      console.error(error);
      toast.error("สร้างเกณฑ์สภาพไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* ส่วนหัว */}
      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800 shrink-0"
        >
          <Link href="/admin/conditions">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <ClipboardList className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">สร้างเกณฑ์สภาพใหม่</h1>
            <p className="text-sm text-zinc-500">เพิ่มรายการเกณฑ์สำหรับใช้ในการประเมินสภาพมือถือ</p>
          </div>
        </div>
      </div>

      {/* ฟอร์ม */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col divide-y divide-zinc-800/60">
            {/* ข้อมูลพื้นฐาน */}
            <div className="p-6 space-y-5">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">ข้อมูลพื้นฐาน</h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-zinc-300">ชื่อเกณฑ์</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="เช่น หน้าจอแตก, ลำโพงเสีย"
                          className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-zinc-300">หมวดหมู่</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full bg-zinc-800/50 border-zinc-700 text-white">
                            <SelectValue placeholder="เลือกหมวดหมู่" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* การตั้งค่า */}
            <div className="p-6 space-y-5">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">การตั้งค่า</h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="answer_type"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-zinc-300">ประเภทคำตอบ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full bg-zinc-800/50 border-zinc-700 text-white">
                            <SelectValue placeholder="เลือกประเภท" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          <SelectItem value="choice">ตัวเลือก (Multiple Choice)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="impact_weight"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-zinc-300">น้ำหนักผลกระทบ</FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger className="w-full bg-zinc-800/50 border-zinc-700 text-white">
                            <SelectValue placeholder="เลือกระดับความสำคัญ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          {IMPACT_WEIGHT_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            return (
                              <SelectItem key={opt.value} value={String(opt.value)}>
                                <div className="flex items-center gap-2">
                                  <Icon className={`w-4 h-4 ${opt.color}`} />
                                  <span>{opt.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

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
                    <FormControl>
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                          {CONDITION_ICONS.map((icon) => (
                            <button
                              key={icon.value}
                              type="button"
                              onClick={() => field.onChange(icon.value)}
                              className={`cursor-pointer aspect-square flex items-center justify-center rounded-lg border-2 transition-all ${
                                field.value === icon.value
                                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                                  : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-300"
                              }`}
                              title={icon.label}
                            >
                              <DynamicIcon name={icon.value} className="h-5 w-5" />
                            </button>
                          ))}
                        </div>
                        <div className="text-xs text-zinc-600 bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-2">
                          <p className="font-medium text-zinc-400 mb-1">เลือกไอคอน:</p>
                          <p>{CONDITION_ICONS.find((i) => i.value === field.value)?.label || "ยังไม่ได้เลือก"}</p>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-zinc-600">ไอคอนที่ใช้แสดงแทนเกณฑ์นี้ในระบบ</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ตัวเลือกคำตอบ */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  ตัวเลือกคำตอบ (เทมเพลต)
                </h2>
              </div>
              <div className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-xl">
                <AnswerGroupForm form={form as any} existingGroups={existingGroups} />
              </div>
            </div>

            {/* ปุ่มดำเนินการ */}
            <div className="p-6 bg-zinc-950/30">
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                  onClick={() => router.back()}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2 shadow-lg shadow-cyan-500/20"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  สร้างเกณฑ์สภาพ
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
