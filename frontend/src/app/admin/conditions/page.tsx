"use client";

import { useConditions } from "@/hooks/useConditions";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  Plus,
  ClipboardList,
  HelpCircle,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  Layers,
  Weight,
  ListChecks,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
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

const ITEMS_PER_PAGE = 10;

export default function ConditionsPage() {
  const { data: conditions, isLoading } = useConditions();
  const [currentPage, setCurrentPage] = useState(1);

  const stats = useMemo(() => {
    if (!conditions) return { total: 0, categories: 0, highWeight: 0 };
    const categorySet = new Set(conditions.map((c: any) => c.category?.name).filter(Boolean));
    return {
      total: conditions.length,
      categories: categorySet.size,
      highWeight: conditions.filter((c: any) => c.impact_weight > 0.5).length,
    };
  }, [conditions]);

  const paginatedData = useMemo(() => {
    if (!conditions) return { items: [], totalPages: 0 };
    const totalPages = Math.ceil(conditions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return {
      items: conditions.slice(startIndex, endIndex),
      totalPages,
    };
  }, [conditions, currentPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm text-zinc-500">กำลังโหลดข้อมูลเกณฑ์สภาพ...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full max-h-[92vh]">
      {/* ส่วนหัว */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-cyan-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">จัดการเกณฑ์สภาพ</h1>
          </div>
          <p className="text-sm text-zinc-500 mt-2 ml-[42px]">
            ตั้งค่าคำถาม, ตัวเลือกคำตอบ และค่าน้ำหนักผลกระทบสำหรับการประเมินสภาพมือถือ
          </p>
        </div>
        <Button
          asChild
          className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30"
        >
          <Link href="/admin/conditions/new">
            <Plus className="w-4 h-4" /> เพิ่มเกณฑ์ใหม่
          </Link>
        </Button>
      </div>

      {/* สถิติภาพรวม */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-cyan-500/10 rounded-lg">
            <ListChecks className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">เกณฑ์ทั้งหมด</p>
            <p className="text-xl font-bold text-white">
              {stats.total} <span className="text-sm font-normal text-zinc-500">รายการ</span>
            </p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-violet-500/10 rounded-lg">
            <Layers className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">หมวดหมู่</p>
            <p className="text-xl font-bold text-white">
              {stats.categories} <span className="text-sm font-normal text-zinc-500">หมวด</span>
            </p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-amber-500/10 rounded-lg">
            <Weight className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">น้ำหนักสูง (&gt;0.5)</p>
            <p className="text-xl font-bold text-white">
              {stats.highWeight} <span className="text-sm font-normal text-zinc-500">รายการ</span>
            </p>
          </div>
        </div>
      </div>

      {/* ตารางเกณฑ์สภาพ */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/50 text-zinc-500 font-medium text-xs top-0 sticky">
              <tr>
                <th className="px-6 py-4 w-[60px]">ลำดับ</th>
                <th className="px-6 py-4 w-[150px]">หมวดหมู่</th>
                <th className="px-6 py-4">คำถาม / เกณฑ์</th>
                <th className="px-6 py-4 w-[120px]">ประเภทคำตอบ</th>
                <th className="px-6 py-4 w-[120px] text-center">น้ำหนักผลกระทบ</th>
                <th className="px-6 py-4 w-[80px] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {paginatedData.items?.map((c: any, index: number) => (
                <tr key={c.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4 text-zinc-600 font-mono text-xs">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                      {c.category?.name || "ไม่มีหมวดหมู่"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1 bg-zinc-800 rounded text-zinc-400">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm leading-snug">{c.name}</p>
                        {c.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{c.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-zinc-400 border-zinc-700/50 font-mono text-[11px]">
                      {c.answer_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`font-bold text-sm ${c.impact_weight > 0.5 ? "text-amber-400" : "text-zinc-500"}`}
                      >
                        {c.impact_weight}
                      </span>
                      <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${c.impact_weight > 0.5 ? "bg-amber-500" : "bg-zinc-600"}`}
                          style={{ width: `${c.impact_weight * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 min-w-[180px]">
                        <DropdownMenuLabel className="text-zinc-400 text-xs">ตัวเลือกจัดการ</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          asChild
                          className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer gap-2"
                        >
                          <Link href={`/admin/conditions/${c.id}`}>
                            <Pencil className="w-4 h-4" />
                            แก้ไขรายละเอียด
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="text-zinc-600 cursor-not-allowed gap-2">
                          <Trash2 className="w-4 h-4" />
                          ลบเกณฑ์ (เร็วๆ นี้)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {(!paginatedData.items || paginatedData.items.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-zinc-800 rounded-full">
                        <PackageOpen className="w-6 h-6 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-zinc-400 font-medium">ยังไม่มีเกณฑ์สภาพในระบบ</p>
                        <p className="text-xs text-zinc-600 mt-1">เริ่มต้นโดยการเพิ่มเกณฑ์ใหม่เพื่อใช้ในการประเมิน</p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
                      >
                        <Link href="/admin/conditions/new">
                          <Plus className="w-3.5 h-3.5" /> เพิ่มเกณฑ์แรก
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {paginatedData.totalPages > 0 && (
          <div className="border-t border-zinc-800/60 bg-zinc-950/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-zinc-400">
              แสดง <span className="font-semibold text-zinc-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> ถึง{" "}
              <span className="font-semibold text-zinc-300">{Math.min(currentPage * ITEMS_PER_PAGE, stats.total)}</span>{" "}
              จาก <span className="font-semibold text-zinc-300">{stats.total}</span> รายการ
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                ก่อนหน้า
              </Button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: paginatedData.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                      currentPage === page
                        ? "bg-cyan-500 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === paginatedData.totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed gap-1.5"
              >
                ถัดไป
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
