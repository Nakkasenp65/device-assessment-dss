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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from "@/components/ui/form";

// Schema for an answer option
const answerOptionSchema = z.object({
  label: z.string().min(1, "Label is required"),
  default_ratio: z.number().min(0).max(1, "Ratio must be between 0 and 1"),
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
      message: "Please complete the answer group selection or creation",
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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-end gap-2 mb-2 bg-secondary/20 p-2 rounded-md"
    >
      <div {...attributes} {...listeners} className="cursor-grab mt-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-2">
        <FormField
          control={control}
          name={`answerGroup.options.${index}.label`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Label</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Minor Scratch" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="w-24 space-y-2">
        <FormField
          control={control}
          name={`answerGroup.options.${index}.default_ratio`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Ratio (0-1)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.1"
                  placeholder="0.25"
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
        className="mb-0.5"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export function AnswerGroupForm({
  form,
  existingGroups,
}: AnswerGroupFormProps) {
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
    <Card className="border-dashed">
      <CardContent className="pt-6 space-y-4">
        <FormField
          control={form.control}
          name="answerGroup.mode"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Answer Group Selection</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={field.value === "select" ? "default" : "outline"}
                    onClick={() => {
                      field.onChange("select");
                      form.setValue("answerGroup.newGroupName", "");
                      form.setValue("answerGroup.options", []);
                    }}
                  >
                    Select Existing
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "create" ? "default" : "outline"}
                    onClick={() => {
                      field.onChange("create");
                      form.setValue("answerGroup.selectedGroupId", "");
                      if (fields.length === 0) {
                        append({ label: "Option 1", default_ratio: 0.25 });
                      }
                    }}
                  >
                    Create New
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
                <FormLabel>Existing Group</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an answer group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {existingGroups.map((group) => (
                      <SelectItem key={group.id} value={String(group.id)}>
                        {group.name} ({group.answerOptions.length} options)
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
                  <FormLabel>New Group Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Screen Condition" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => append({ label: "", default_ratio: 0 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <SortableOption
                        key={field.id}
                        id={field.id}
                        index={index}
                        remove={remove}
                        control={form.control}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
