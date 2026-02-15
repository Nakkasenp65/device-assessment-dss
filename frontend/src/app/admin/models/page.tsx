"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrands } from "@/hooks/useBrands";
import { useModels, useCreateModel, useDeleteModel } from "@/hooks/useModels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Smartphone,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export default function ModelsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrandId, setFilterBrandId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: brands } = useBrands();
  const { data: models, isLoading } = useModels();

  const createMutation = useCreateModel();
  const deleteMutation = useDeleteModel();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && brandId && releaseYear) {
      createMutation.mutate(
        {
          name,
          brand_id: Number(brandId),
          release_year: Number(releaseYear),
        },
        {
          onSuccess: () => {
            setName("");
            setBrandId("");
            setReleaseYear("");
            setIsCreateOpen(false);
            toast.success("เพิ่มรุ่นมือถือสำเร็จ");
          },
          onError: () => {
            toast.error("เกิดข้อผิดพลาดในการเพิ่มรุ่นมือถือ");
          },
        },
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("คุณต้องการลบรุ่นมือถือนี้ใช่หรือไม่?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("ลบรุ่นมือถือสำเร็จ"),
        onError: () => toast.error("เกิดข้อผิดพลาดในการลบรุ่นมือถือ"),
      });
    }
  };

  const filteredModels = useMemo(() => {
    return models?.filter((model: any) => {
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.brand?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = filterBrandId === "all" || model.brand_id === Number(filterBrandId);
      return matchesSearch && matchesBrand;
    });
  }, [models, searchQuery, filterBrandId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBrandId]);

  const paginatedData = useMemo(() => {
    if (!filteredModels) return { items: [], totalPages: 0 };
    const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return {
      items: filteredModels.slice(startIndex, endIndex),
      totalPages,
    };
  }, [filteredModels, currentPage]);

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
          <h1 className="text-2xl font-bold text-white">จัดการรุ่นมือถือ</h1>
          <p className="text-sm text-zinc-500 mt-1">
            เพิ่ม, แก้ไข หรือลบรุ่นมือถือในระบบ ({filteredModels?.length || 0} รายการ)
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              เพิ่มรุ่นมือถือ
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>เพิ่มรุ่นมือถือใหม่</DialogTitle>
              <DialogDescription className="text-zinc-400">
                กรอกรายละเอียดของรุ่นมือถือที่ต้องการเพิ่ม
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">แบรนด์</label>
                <Select value={brandId} onValueChange={setBrandId} required>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50">
                    <SelectValue placeholder="เลือกแบรนด์" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {brands?.map((brand: any) => (
                      <SelectItem
                        key={brand.id}
                        value={String(brand.id)}
                        className="focus:bg-zinc-800 focus:text-white cursor-pointer"
                      >
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">ชื่อรุ่น</label>
                <Input
                  placeholder="เช่น iPhone 15 Pro, Galaxy S24"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">ปีที่เปิดตัว</label>
                <Input
                  type="number"
                  placeholder="เช่น 2024"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50"
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-zinc-400 hover:text-white"
                  disabled={createMutation.isPending}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  disabled={createMutation.isPending || !name || !brandId || !releaseYear}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึก"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อรุ่น หรือ แบรนด์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>

        {/* Filter */}
        <div className="w-full md:w-[200px]">
          <Select value={filterBrandId} onValueChange={setFilterBrandId}>
            <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white h-[42px] rounded-xl">
              <div className="flex items-center gap-2 text-zinc-400">
                <Filter className="w-4 h-4" />
                <span className="text-white">
                  {filterBrandId === "all"
                    ? "ทุกแบรนด์"
                    : brands?.find((b: any) => String(b.id) === filterBrandId)?.name || "เลือกแบรนด์"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              <SelectItem value="all" className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                ทุกแบรนด์
              </SelectItem>
              {brands?.map((brand: any) => (
                <SelectItem
                  key={brand.id}
                  value={String(brand.id)}
                  className="focus:bg-zinc-800 focus:text-white cursor-pointer"
                >
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 flex flex-col">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/50 text-zinc-500 font-medium uppercase text-xs sticky top-0">
              <tr>
                <th className="px-6 py-4 w-[100px]">ID</th>
                <th className="px-6 py-4">ชื่อรุ่น</th>
                <th className="px-6 py-4">แบรนด์</th>
                <th className="px-6 py-4">ปีที่เปิดตัว</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {paginatedData.items?.map((model: any, index: number) => (
                <tr key={model.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-zinc-600 font-mono text-xs">
                    #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300 transition-colors">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-white">{model.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {model.brand?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 font-mono">{model.release_year}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                        <DropdownMenuItem className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" />
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                          onClick={() => handleDelete(model.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {(!paginatedData.items || paginatedData.items.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    ไม่พบรายการรุ่นมือถือ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedData.totalPages > 0 && (
          <div className="border-t border-zinc-800/60 bg-zinc-950/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-zinc-400">
              แสดง <span className="font-semibold text-zinc-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> ถึง{" "}
              <span className="font-semibold text-zinc-300">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredModels?.length || 0)}
              </span>{" "}
              จาก <span className="font-semibold text-zinc-300">{filteredModels?.length || 0}</span> รายการ
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                onClick={() => setCurrentPage((p) => Math.min(p + 1, paginatedData.totalPages))}
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
