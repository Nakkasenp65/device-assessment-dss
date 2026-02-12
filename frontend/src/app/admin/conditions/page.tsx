"use client";

import { useConditions } from "@/hooks/useConditions";
import Link from "next/link";
import {
  Plus,
  Settings,
  HelpCircle,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function ConditionsPage() {
  const { data: conditions, isLoading } = useConditions();

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
          <h1 className="text-2xl font-bold text-white">จัดการเกณฑ์สภาพ</h1>
          <p className="text-sm text-zinc-500 mt-1">
            ตั้งค่าคำถาม, ตัวเลือกคำตอบ และค่าน้ำหนักผลกระทบ (
            {conditions?.length || 0} รายการ)
          </p>
        </div>
        <Button
          asChild
          className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
        >
          <Link href="/admin/conditions/new">
            <Plus className="w-4 h-4" /> เพิ่มเกณฑ์ใหม่
          </Link>
        </Button>
      </div>

      {/* Stats Section (Optional - maybe by category later) */}

      {/* Conditions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/50 text-zinc-500 font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4 w-[60px]">ID</th>
                <th className="px-6 py-4 w-[150px]">หมวดหมู่</th>
                <th className="px-6 py-4">คำถาม / เกณฑ์</th>
                <th className="px-6 py-4 w-[120px]">ประเภท</th>
                <th className="px-6 py-4 w-[100px] text-center">น้ำหนัก</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {conditions?.map((c: any) => (
                <tr
                  key={c.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4 text-zinc-600 font-mono text-xs">
                    #{c.id}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {c.category?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-zinc-500">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-base">
                          {c.name}
                        </p>
                        {c.description && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className="text-zinc-400 border-zinc-700 font-mono text-xs"
                    >
                      {c.answer_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`font-bold ${c.impact_weight > 0.5 ? "text-amber-500" : "text-zinc-500"}`}
                    >
                      {c.impact_weight}
                    </span>
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
                          asChild
                          className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                        >
                          <Link href={`/admin/conditions/${c.id}`}>
                            <Pencil className="w-4 h-4 mr-2" />
                            แก้ไขรายละเอียด
                          </Link>
                        </DropdownMenuItem>
                        {/* Delete not implemented yet in hook */}
                        <DropdownMenuItem
                          disabled
                          className="text-zinc-600 cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          ลบเกณฑ์ (เร็วๆนี้)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {(!conditions || conditions.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    ยังไม่มีเกณฑ์สภาพในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
