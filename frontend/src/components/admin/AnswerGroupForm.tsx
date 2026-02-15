"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormItem, FormLabel, FormMessage, FormField } from "@/components/ui/form";

// Schema for an answer option
const answerOptionSchema = z.object({
  label: z.string().min(1, "กรุณากรอกชื่อตัวเลือก"),
  default_ratio: z.number().min(0).max(1, "อัตราส่วนต้องอยู่ระหว่าง 0 ถึง 1"),
});

// Schema for creating a new group
export const answerGroupSchema = z
  .object({
    mode: z.enum(["select", "create"]),
    selectedGroupId: z.string().optional(),
    newGroupName: z.string().optional(),
    options: z.array(answerOptionSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.mode === "select" && !data.selectedGroupId) {
        return false;
      }
      if (data.mode === "create") {
        if (!data.newGroupName) return false;
        if (!data.options || data.options.length === 0) return false;
      }
      return true;
    },
    {
      message: "กรุณากรอกข้อมูลกลุ่มคำตอบให้ครบถ้วน",
      path: ["mode"], // Error path
    },
  );

export type AnswerGroupFormValues = z.infer<typeof answerGroupSchema>;

interface AnswerGroupFormProps {
  form: any; // Parent form control
  existingGroups: { id: number; name: string; answerOptions: any[] }[];
}

// Sortable Item Component
function SortableOption({
  id,
  index,
  remove,
  control,
}: {
  id: string;
  index: number;
  remove: (index: number) => void;
  control: Control<any>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-end gap-2 mb-2 bg-zinc-800/40 border border-zinc-700/50 p-3 rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-grab mt-2">
        <GripVertical className="h-5 w-5 text-zinc-600 hover:text-zinc-400 transition-colors" />
      </div>
      <div className="flex-1 space-y-2">
        <FormField
          control={control}
          name={`answerGroup.options.${index}.label`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-zinc-400">ชื่อตัวเลือก</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="เช่น รอยขีดข่วนเล็กน้อย"
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-600"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="w-28 space-y-2">
        <FormField
          control={control}
          name={`answerGroup.options.${index}.default_ratio`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-zinc-400">อัตราส่วน (0-1)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.1"
                  placeholder="0.25"
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-600"
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => remove(index)}
        className="mb-0.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function AnswerGroupForm({ form, existingGroups }: AnswerGroupFormProps) {
  const mode = form.watch("answerGroup.mode");

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "answerGroup.options",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
    }
  }

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="answerGroup.mode"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-zinc-300">เลือกกลุ่มคำตอบ</FormLabel>
            <FormControl>
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant={field.value === "select" ? "default" : "outline"}
                  className={
                    field.value === "select"
                      ? "flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                      : "flex-1 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }
                  onClick={() => {
                    field.onChange("select");
                    form.setValue("answerGroup.newGroupName", "");
                    form.setValue("answerGroup.options", []);
                  }}
                >
                  เลือกกลุ่มที่มีอยู่
                </Button>
                <Button
                  type="button"
                  variant={field.value === "create" ? "default" : "outline"}
                  className={
                    field.value === "create"
                      ? "flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                      : "flex-1 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }
                  onClick={() => {
                    field.onChange("create");
                    form.setValue("answerGroup.selectedGroupId", "");
                    if (fields.length === 0) {
                      append({ label: "ตัวเลือกที่ 1", default_ratio: 0.25 });
                    }
                  }}
                >
                  สร้างกลุ่มใหม่
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {mode === "select" && (
        <FormField
          control={form.control}
          name="answerGroup.selectedGroupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">กลุ่มคำตอบที่มีอยู่</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-700 text-white">
                    <SelectValue placeholder="เลือกกลุ่มคำตอบ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {existingGroups.map((group) => (
                    <SelectItem key={group.id} value={String(group.id)}>
                      {group.name} ({group.answerOptions.length} ตัวเลือก)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {mode === "create" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <FormField
            control={form.control}
            name="answerGroup.newGroupName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">ชื่อกลุ่มคำตอบใหม่</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="เช่น สภาพหน้าจอ"
                    className="w-full bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-600"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">รายการตัวเลือก</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1.5"
                onClick={() => append({ label: "", default_ratio: 0 })}
              >
                <Plus className="h-3.5 w-3.5" />
                เพิ่มตัวเลือก
              </Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <SortableOption key={field.id} id={field.id} index={index} remove={remove} control={form.control} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {fields.length === 0 && (
              <div className="text-center py-6 text-zinc-600 text-sm">
                ยังไม่มีตัวเลือก — กดปุ่ม &quot;เพิ่มตัวเลือก&quot; เพื่อเริ่มต้น
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
