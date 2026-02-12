"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AhpWizard } from "./AhpWizard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewPathPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (newPath: any) => {
      const res = await api.post("/paths", newPath);
      return res.data.data; // Return the created path to get ID
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["decision-paths"] });
      toast.success("สร้างเส้นทางใหม่สำเร็จ");
      // Redirect to AHP configuration for the new path (or Dashboard)
      // Original logic redirected to AHP page.
      router.push(`/admin/paths/${data.id}/ahp`);
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาดในการสร้างเส้นทาง");
      console.error(error);
    },
  });

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent text-zinc-400 hover:text-white"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับไปหน้าเส้นทาง
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          สร้างเส้นทางตัดสินใจใหม่
        </h1>
        <p className="text-zinc-500 mt-2">
          กำหนดผลลัพธ์ใหม่สำหรับระบบประเมิน หลังจากสร้างเส้นทางแล้ว
          คุณจะถูกนำไปกำหนดน้ำหนักความสำคัญ (AHP)
        </p>
      </div>

      <AhpWizard
        onSave={(values) => createMutation.mutate(values)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
