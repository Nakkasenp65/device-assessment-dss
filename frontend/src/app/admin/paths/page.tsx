"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  GitMerge,
  Loader2,
  MoreVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PathForm } from "./PathForm";
import { toast } from "sonner";
import { DynamicIcon } from "@/components/DynamicIcon";

export default function PathsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingPath, setEditingPath] = useState<any>(null);

  const { data: paths, isLoading } = useQuery({
    queryKey: ["decision-paths"],
    queryFn: async () => {
      const res = await api.get("/paths");
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedPath: any) => {
      const { id, ...data } = updatedPath;
      await api.put(`/paths/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision-paths"] });
      setEditingPath(null);
      toast.success("อัปเดตเส้นทางสำเร็จ");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตเส้นทาง");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/paths/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision-paths"] });
      toast.success("ลบเส้นทางสำเร็จ");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาดในการลบเส้นทาง");
      console.error(error);
    },
  });

  const handleDelete = (id: string) => {
    if (
      confirm(
        "คุณต้องการลบเส้นทางนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            จัดการเส้นทางประเมิน
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            กำหนดเส้นทางผลลัพธ์ (Outcome Paths) และค่าน้ำหนัก AHP (
            {paths?.length || 0} เส้นทาง)
          </p>
        </div>
        <Button
          asChild
          className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
        >
          <Link href="/admin/paths/new">
            <Plus className="w-4 h-4" /> เพิ่มเส้นทางใหม่
          </Link>
        </Button>
      </div>

      {/* Stats Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4 max-w-sm">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-zinc-500">เส้นทางที่ใช้งานอยู่</p>
          <p className="text-2xl font-bold text-white">{paths?.length || 0}</p>
        </div>
      </div>

      {/* Paths List Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/50 text-zinc-500 font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4">เส้นทาง</th>
                <th className="px-6 py-4">รหัส</th>
                <th className="px-6 py-4 w-[40%]">คำอธิบาย</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {paths?.map((path: any) => (
                <tr
                  key={path.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
                        {path.icon ? (
                          <DynamicIcon name={path.icon} className="w-5 h-5" />
                        ) : (
                          <GitMerge className="w-5 h-5" />
                        )}
                      </div>
                      <span className="font-bold text-white text-base">
                        {path.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 font-mono text-xs">
                    <span className="bg-zinc-800 px-2 py-1 rounded text-zinc-400">
                      {path.code || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-zinc-500 text-xs line-clamp-2">
                      {path.description_template}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-zinc-900 border-zinc-800"
                      >
                        <DropdownMenuLabel className="text-zinc-400">
                          ตัวเลือกจัดการ
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                          onClick={() =>
                            router.push(`/admin/paths/${path.id}/ahp`)
                          }
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          จัดการ AHP (Pairwise)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                          onClick={() => setEditingPath(path)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          แก้ไขรายละเอียด
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                          onClick={() => handleDelete(path.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          ลบเส้นทาง
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {(!paths || paths.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    ยังไม่มีเส้นทางในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPath}
        onOpenChange={(open) => !open && setEditingPath(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>แก้ไขเส้นทางประเมิน</DialogTitle>
            <DialogDescription className="text-zinc-400">
              แก้ไขข้อมูลเส้นทางและค่าน้ำหนักตั้งต้น
            </DialogDescription>
          </DialogHeader>
          {editingPath && (
            <PathForm
              initialData={editingPath}
              onSubmit={(values) =>
                updateMutation.mutate({ ...values, id: editingPath.id })
              }
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
