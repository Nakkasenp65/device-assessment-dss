"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Smartphone,
  Star,
  Users,
  LayoutDashboard,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { DynamicIcon } from "@/components/DynamicIcon";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalAssessments: number;
  recentAssessments: any[];
  modelStats: {
    model_id: number;
    name: string;
    count: number;
    percentage: number;
  }[];
  averageRating: number;
  totalFeedback: number;
  recentFeedback: any[];
}

// ─── SVG Charts ─────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: DashboardStats["modelStats"] }) {
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const colors = [
    "text-cyan-500",
    "text-purple-500",
    "text-emerald-500",
    "text-amber-500",
    "text-rose-500",
  ];

  // If no data, show empty gray ring
  if (data.length === 0) {
    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-800"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-zinc-500">0</span>
          <span className="text-xs text-zinc-600">Total</span>
        </div>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-800"
        />
        {/* Segments */}
        {data.map((item, index) => {
          const percentage = item.count / total;
          const dashArray = percentage * circumference;
          const currentOffset = offset;
          offset += dashArray; // Update offset for next segment

          return (
            <circle
              key={item.model_id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${circumference}`}
              strokeDashoffset={-currentOffset}
              className={`${colors[index % colors.length]} transition-all duration-1000`}
            />
          );
        })}
      </svg>
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white">
          {total.toLocaleString()}
        </span>
        <span className="text-sm text-zinc-500">ครั้ง</span>
      </div>
    </div>
  );
}

function TrendChart({ hasData }: { hasData: boolean }) {
  if (!hasData) {
    return (
      <div className="w-full h-[100px] mt-8 flex items-center justify-center text-zinc-600 text-xs">
        ไม่มีข้อมูลเพียงพอสำหรับแสดงกราฟ
      </div>
    );
  }

  // Static mock trend to match prototype visual for now
  // Real implementation would need historical aggregation API
  const points = [20, 45, 30, 60, 55, 75, 70];
  const max = 100;
  const width = 300;
  const height = 100;

  const pathData = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - (p / max) * height;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-[100px] mt-8">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cyan-500"
        />
        {/* Points */}
        {points.map((p, i) => {
          const x = (i / (points.length - 1)) * width;
          const y = height - (p / max) * height;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              className="text-cyan-500 fill-zinc-900 stroke-2 stroke-current"
            />
          );
        })}
      </svg>
      {/* Axis Labels */}
      <div className="flex justify-between mt-2 text-[10px] text-zinc-500 px-1 font-mono uppercase">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // endpoint is mounted via assessmentRoutes at /api/assessments
        // So full path is /assessments/admin/stats
        const response = await api.get("/assessments/admin/stats");
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!stats) return null;

  const colors = [
    "bg-cyan-500",
    "bg-purple-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-cyan-500" />
          ภาพรวมความพึงพอใจ
        </h1>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ระบบทำงานปกติ
          </span>
          <span>{format(new Date(), "d MMM yyyy")}</span>
        </div>
      </div>

      {/* ─── Top Stats Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Distribution Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                สัดส่วนรุ่นมือถือที่ถูกประเมิน
              </h2>
              <p className="text-sm text-zinc-500">
                ข้อมูลจากการประเมินทั้งหมด
              </p>
            </div>
            <button className="text-zinc-500 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0">
              <DonutChart data={stats.modelStats} />
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-3 w-full">
              {stats.modelStats.map((item, index) => (
                <div
                  key={item.model_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                    />
                    <span
                      className="text-sm text-zinc-300 font-medium truncate max-w-[120px]"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Satisfaction Score Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-white">
                คะแนนความพึงพอใจเฉลี่ย
              </h2>
              <div className="flex items-end gap-3 mt-4">
                <span className="text-5xl font-black text-white tracking-tight">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-zinc-500 mb-1.5 ">
                  / 5.0 คะแนน
                </span>
                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-bold mb-1.5 ml-2">
                  <ArrowUpRight className="w-3 h-3" />
                  +0.2
                </div>
              </div>
            </div>
            <div className="px-3 py-1 rounded bg-zinc-800 text-xs text-zinc-400 border border-zinc-700">
              7 วันล่าสุด
            </div>
          </div>

          <TrendChart hasData={stats.totalFeedback >= 2} />
        </div>
      </div>

      {/* ─── Bottom Content Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        {/* Recent Assessments Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              รายการประเมินล่าสุด
            </h2>
            <Link
              href="/admin/assessments"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/50 text-zinc-500 font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">ชื่อรุ่นมือถือ</th>
                  <th className="px-6 py-4">ผู้ประเมิน</th>
                  <th className="px-6 py-4">วันที่/เวลา</th>
                  <th className="px-6 py-4">ผลลัพธ์</th>
                  <th className="px-6 py-4 text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {stats.recentAssessments.map((assessment) => (
                  <tr
                    key={assessment.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
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
                    <td className="px-6 py-4 text-zinc-300">
                      {assessment.user?.name || "ไม่ระบุ"}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      <div className="flex flex-col">
                        <span>
                          {format(
                            new Date(assessment.created_at),
                            "d MMM yyyy",
                          )}
                        </span>
                        <span className="text-xs text-zinc-600">
                          {format(new Date(assessment.created_at), "HH:mm")} น.
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {assessment.pathScores[0]?.decisionPath.icon ? (
                        <div
                          className="flex items-center gap-1.5 text-zinc-300"
                          title={assessment.pathScores[0].decisionPath.name}
                        >
                          <DynamicIcon
                            name={assessment.pathScores[0].decisionPath.icon}
                            className="w-4 h-4"
                          />
                          <span className="truncate max-w-[100px]">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Feedback Sidebar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-zinc-500" />
              ความเห็นล่าสุด
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {stats.recentFeedback.length > 0 ? (
              stats.recentFeedback.map((fb) => (
                <div
                  key={fb.answer_id}
                  className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold ring-1 ring-indigo-500/30">
                        {fb.assessment.user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">
                          {fb.assessment.user?.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1">
                          {format(new Date(fb.created_at), "d MMM, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= fb.rate ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {fb.comment && (
                    <p className="text-xs text-zinc-400 leading-relaxed italic border-l-2 border-zinc-800 pl-3 py-1">
                      "{fb.comment}"
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-500">
                <p>ยังไม่มีความคิดเห็น</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
