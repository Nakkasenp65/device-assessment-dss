"use client";

import { useState } from "react";
import { useUsers, useUpdateUserRole, useDeleteUser } from "@/hooks/useUsers";
import type { User } from "@/api/users";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Trash2,
  ShieldCheck,
  User as UserIcon,
  Search,
  Users,
  ShieldAlert,
  Loader2,
  MoreVertical,
  Mail,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const updateRoleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();
  const [search, setSearch] = useState("");

  const filtered = (users ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const adminCount = (users ?? []).filter((u) => u.role === "admin").length;
  const userCount = (users ?? []).filter((u) => u.role === "user").length;

  const handleToggleRole = (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin";

    // Optimistic update or just wait for invalidation? Hook likely handles invalidation.
    // Using toast promise for better UX
    const promise = updateRoleMutation.mutateAsync({
      id: user.id,
      role: newRole,
    });

    toast.promise(promise, {
      loading: "กำลังอัปเดตสิทธิ์ผู้ใช้งาน...",
      success: `เปลี่ยนสิทธิ์ของ ${user.name} เป็น ${newRole} สำเร็จ`,
      error: "เกิดข้อผิดพลาดในการอัปเดตสิทธิ์",
    });
  };

  const handleDelete = (user: User) => {
    if (confirm(`คุณต้องการลบผู้ใช้งาน "${user.name}" ใช่หรือไม่?`)) {
      const promise = deleteMutation.mutateAsync(user.id);
      toast.promise(promise, {
        loading: "กำลังลบผู้ใช้งาน...",
        success: "ลบผู้ใช้งานสำเร็จ",
        error: "เกิดข้อผิดพลาดในการลบผู้ใช้งาน",
      });
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
          <h1 className="text-2xl font-bold text-white">จัดการผู้ใช้งาน</h1>
          <p className="text-sm text-zinc-500 mt-1">
            ดูและจัดการบัญชีผู้ใช้งานและกำหนดสิทธิ์ในระบบ ({users?.length || 0}{" "}
            บัญชี)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">ผู้ใช้งานทั้งหมด</p>
            <p className="text-2xl font-bold text-white">
              {users?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">ผู้ดูแลระบบ</p>
            <p className="text-2xl font-bold text-white">{adminCount}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">ผู้ใช้ทั่วไป</p>
            <p className="text-2xl font-bold text-white">{userCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50 w-full md:w-fit">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ อีเมล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/50 text-zinc-500 font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4 w-[80px]">ID</th>
                <th className="px-6 py-4">ผู้ใช้งาน</th>
                <th className="px-6 py-4">อีเมล</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-center">การประเมิน</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    {search ? "ไม่พบผู้ใช้งานที่ค้นหา" : "ไม่มีผู้ใช้งานในระบบ"}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4 text-zinc-600 font-mono text-xs">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200 transition-colors">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          user.role === "admin"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <>
                            <ShieldAlert className="w-3 h-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-3 h-3" />
                            User
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-300">
                      {user._count?.assessments ?? 0}
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
                            onClick={() => handleToggleRole(user)}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            เปลี่ยนเป็น{" "}
                            {user.role === "admin" ? "User" : "Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบผู้ใช้งาน
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
