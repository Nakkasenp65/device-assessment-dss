"use client";

import { useState } from "react";
import { useBrands, useCreateBrand, useDeleteBrand } from "@/hooks/useBrands";
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
import {
  Smartphone,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function BrandsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: brands, isLoading } = useBrands();
  const createMutation = useCreateBrand();
  const deleteMutation = useDeleteBrand();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBrandName.trim()) {
      createMutation.mutate(newBrandName, {
        onSuccess: () => {
          setNewBrandName("");
          setIsCreateOpen(false);
          toast.success("เพิ่มแบรนด์สำเร็จ");
        },
        onError: () => {
          toast.error("เกิดข้อผิดพลาดในการเพิ่มแบรนด์");
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("คุณต้องการลบแบรนด์นี้ใช่หรือไม่?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("ลบแบรนด์สำเร็จ"),
        onError: () => toast.error("เกิดข้อผิดพลาดในการลบแบรนด์"),
      });
    }
  };

  const filteredBrands = brands?.filter((brand: any) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          <h1 className="text-2xl font-bold text-white">จัดการแบรนด์</h1>
          <p className="text-sm text-zinc-500 mt-1">
            เพิ่ม, แก้ไข หรือลบแบรนด์มือถือในระบบ
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              เพิ่มแบรนด์
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>เพิ่มแบรนด์ใหม่</DialogTitle>
              <DialogDescription className="text-zinc-400">
                กรอกชื่อแบรนด์ที่ต้องการเพิ่มลงในระบบ
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  ชื่อแบรนด์
                </label>
                <Input
                  autoFocus
                  placeholder="เช่น Apple, Samsung"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white focus:ring-cyan-500/50"
                  disabled={createMutation.isPending}
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
                  disabled={createMutation.isPending || !newBrandName.trim()}
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

      {/* Search & Filter */}
      <div className="flex items-center gap-4 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50 w-full md:w-fit">
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="ค้นหาแบรนด์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBrands?.map((brand: any) => (
          <div
            key={brand.id}
            className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-black/20"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <DropdownMenuItem className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" />
                    แก้ไข
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                    onClick={() => handleDelete(brand.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col items-center text-center pt-2">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 border border-zinc-700/50 shadow-inner">
                <span className="text-2xl font-bold text-zinc-500 group-hover:text-cyan-400 transition-colors">
                  {brand.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <h3 className="font-bold text-lg text-white mb-1 group-hover:text-cyan-400 transition-colors">
                {brand.name}
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-950/50 px-2.5 py-1 rounded-full border border-zinc-800 mt-2">
                <Smartphone className="w-3 h-3" />
                <span>{brand._count?.models || 0} รุ่นมือถือ</span>
              </div>
            </div>
          </div>
        ))}

        {/* Add Brand Card (Ghost) */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 mb-3 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium text-zinc-500 group-hover:text-cyan-400 transition-colors">
            เพิ่มแบรนด์ใหม่
          </span>
        </button>
      </div>

      {filteredBrands?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-500">ไม่พบแบรนด์ตามคำค้นหา</p>
        </div>
      )}
    </div>
  );
}
