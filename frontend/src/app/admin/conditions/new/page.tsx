"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AnswerGroupForm,
  answerGroupSchema,
} from "@/components/admin/AnswerGroupForm";
import api from "@/lib/api";
import { CONDITION_ICONS } from "@/constants/icons";
import { DynamicIcon } from "@/components/DynamicIcon";

const IMPACT_WEIGHT_OPTIONS = [
  { label: "⚪ Low (Cosmetic)", value: 1 },
  { label: "🟡 Medium (Minor)", value: 3 },
  { label: "🟠 High (Major)", value: 5 },
  { label: "🔴 Critical (Showstopper)", value: 10 },
] as const;

// Combined Schema
const conditionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category_id: z.string().min(1, "Category is required"),
  answer_type: z.enum(["choice", "text", "number"]),
  impact_weight: z.coerce.number().refine((v) => [1, 3, 5, 10].includes(v), {
    message: "Must be one of: 1, 3, 5, 10",
  }),
  icon: z.string().optional(),
  answerGroup: answerGroupSchema,
});

type ConditionFormValues = z.infer<typeof conditionSchema>;

export default function CreateConditionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [existingGroups, setExistingGroups] = useState<
    { id: number; name: string; answerOptions: any[] }[]
  >([]);

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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsRes = await api.get("/answer-groups");
        setExistingGroups(groupsRes.data);

        // Mock categories for now if endpoint fails or not implemented
        try {
          const catRes = await api.get("/conditions/categories");
          setCategories(catRes.data.data);
        } catch (e) {
          console.warn("Using mock categories");
          setCategories([
            { id: 1, name: "Physical Condition" },
            { id: 2, name: "Functional Condition" },
            { id: 3, name: "Age & Usage" },
          ]);
        }
      } catch (error) {
        toast.error("Failed to load initial data");
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
          toast.error("Please select an answer group");
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
      toast.success("Condition created successfully");
      router.push("/admin/conditions");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create condition");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl px-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Condition</CardTitle>
          <CardDescription>
            Add a new defect or condition for assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Broken Screen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="answer_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="choice">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="text" disabled>
                            Text (Coming soon)
                          </SelectItem>
                          <SelectItem value="number" disabled>
                            Number (Coming soon)
                          </SelectItem>
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
                    <FormItem>
                      <FormLabel>Impact Weight</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select importance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {IMPACT_WEIGHT_OPTIONS.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={String(opt.value)}
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How critical is this condition to the overall score?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONDITION_ICONS.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2">
                                <DynamicIcon
                                  name={icon.value}
                                  className="h-4 w-4"
                                />
                                <span>{icon.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Visual representation for this condition.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium">
                  Answer Options (Template)
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <AnswerGroupForm
                    form={form as any}
                    existingGroups={existingGroups}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Condition
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
