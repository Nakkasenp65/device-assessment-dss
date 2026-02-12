"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Smartphone,
  CheckCircle2,
  MoreVertical,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Button } from "@/components/ui/button";

interface Assessment {
  id: number;
  created_at: string;
  model: {
    name: string;
    brand: { name: string };
  };
  storage_gb: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  pathScores: {
    total_score: number;
    decisionPath: {
      name: string;
      icon: string | null;
    };
  }[];
  status: string;
}

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get("/assessments/admin/all");
        setAssessments(response.data.data);
      } catch (error) {
        console.error("Failed to load assessments", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            ประวัติการประเมินทั้งหมด
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            รายการประเมินสภาพมือถือทั้งหมดในระบบ ({assessments.length} รายการ)
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Filter className="w-4 h-4" />
            ตัวกรอง
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Download className="w-4 h-4" />
            ส่งออก
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="ค้นหาตามชื่อรุ่น, ชื่อผู้ใช้งาน..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/50 text-zinc-500 font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">ชื่อรุ่นมือถือ</th>
                <th className="px-6 py-4">ผู้ประเมิน</th>
                <th className="px-6 py-4">วันที่/เวลา</th>
                <th className="px-6 py-4">ผลลัพธ์</th>
                <th className="px-6 py-4 text-right">สถานะ</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {assessments.map((assessment) => (
                <tr
                  key={assessment.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4 text-zinc-600 font-mono text-xs">
                    #{assessment.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300 transition-colors">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {assessment.model.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {assessment.storage_gb > 0
                            ? `${assessment.storage_gb}GB`
                            : "N/A"}{" "}
                          • {assessment.model.brand.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-300 font-medium">
                        {assessment.user?.name || "ไม่ระบุ"}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {assessment.user?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    <div className="flex flex-col">
                      <span>
                        {format(new Date(assessment.created_at), "d MMM yyyy")}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {format(new Date(assessment.created_at), "HH:mm")} น.
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {assessment.pathScores &&
                    assessment.pathScores[0]?.decisionPath.icon ? (
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <DynamicIcon
                          name={assessment.pathScores[0].decisionPath.icon}
                          className="w-4 h-4"
                        />
                        <span className="truncate max-w-[120px]">
                          {assessment.pathScores[0].decisionPath.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      เสร็จสิ้น
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-500 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {assessments.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    ไม่พบรายการประเมิน
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
