"use client";

import { useEffect, useState } from "react";
import { useAssessment } from "@/context/AssessmentContext";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Trophy,
  Shield,
  Cpu,
  Clock,
  ArrowRight,
  ChevronRight,
  Star,
  BarChart3,
  Loader2,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { FeedbackForm } from "@/components/assessment/FeedbackForm";
import { DynamicIcon } from "@/components/DynamicIcon";
import { getRecommendationReason } from "@/utils/dssLogic";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PathScore {
  id: number;
  total_score: number;
  score_physical: number;
  score_functional: number;
  score_age: number;
  rank: number;
  is_recommended: boolean;
  decisionPath: {
    id: number;
    name: string;
    description_template: string;
    weight_physical: number;
    weight_functional: number;
    weight_age: number;
    icon?: string;
  };
}

interface AssessmentCondition {
  id: number;
  value_scale: number;
  score_ratio: number;
  final_score: number;
  condition: {
    name: string;
    icon?: string;
    category: {
      id: number;
      name: string;
    };
  };
  answerOption: {
    label: string;
  };
}

interface AssessmentDetails {
  id: number;
  storage_gb: number;
  created_at: string;
  model: {
    name: string;
    release_year: number;
    brand: {
      name: string;
    };
  };
  assessmentConditions: AssessmentCondition[];
  pathScores: PathScore[];
  feedback: { rate: number; comment: string | null }[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400/80";
  if (score >= 60) return "text-sky-400/80";
  if (score >= 40) return "text-amber-400/80";
  return "text-red-400/80";
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return "stroke-emerald-400/70";
  if (score >= 60) return "stroke-sky-400/70";
  if (score >= 40) return "stroke-amber-400/70";
  return "stroke-red-400/70";
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-400/60";
  if (score >= 60) return "bg-sky-400/60";
  if (score >= 40) return "bg-amber-400/60";
  return "bg-red-400/60";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "ยอดเยี่ยม";
  if (score >= 60) return "ดี";
  if (score >= 40) return "พอใช้";
  return "ต่ำ";
}

// ─── Score Ring Component ───────────────────────────────────────────────────

function ScoreRing({ score, size = 160, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={`${getScoreRingColor(score)} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-black tabular-nums ${getScoreColor(score)}`}>{Math.round(score)}</span>
        <span className="text-xs text-zinc-500 mt-0.5">คะแนนเต็ม 100</span>
      </div>
    </div>
  );
}

// ─── Score Bar Component ────────────────────────────────────────────────────

function ScoreBar({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-zinc-300">
          {icon}
          <span>{label}</span>
        </div>
        <span className={`font-bold tabular-nums ${getScoreColor(score)}`}>{Math.round(score)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${getScoreBarColor(score)} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AssessmentResultPage() {
  const { reset } = useAssessment();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!id) {
      router.push("/assessment/brand");
      return;
    }

    async function loadAssessment() {
      try {
        const res = await api.get(`/assessments/${id}`);
        setAssessment(res.data.data);
      } catch (err) {
        console.error("Failed to load assessment result", err);
        setError("Failed to load assessment result.");
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
          <p className="text-zinc-400">กำลังวิเคราะห์ผลลัพธ์...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">{error || "ไม่พบผลการประเมิน"}</p>
          <button
            onClick={() => router.push("/assessment/brand")}
            className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            ประเมินใหม่
          </button>
        </div>
      </div>
    );
  }

  const recommended = assessment.pathScores.find((p) => p.is_recommended);
  const otherPaths = assessment.pathScores.filter((p) => !p.is_recommended);
  const physicalScore = recommended?.score_physical ?? 0;
  const functionalScore = recommended?.score_functional ?? 0;
  const ageScore = recommended?.score_age ?? 0;
  const totalScore = recommended?.total_score ?? 0;

  const reasonText = recommended
    ? getRecommendationReason(recommended.decisionPath, {
        physical: physicalScore,
        functional: functionalScore,
        age: ageScore,
      })
    : "";

  // Group conditions by category
  const physicalConditions = assessment.assessmentConditions.filter(
    (ac) => ac.condition.category?.name === "Physical" || ac.condition.category?.name === "สภาพตัวเครื่อง",
  );
  const functionalConditions = assessment.assessmentConditions.filter(
    (ac) => ac.condition.category?.name === "Functional" || ac.condition.category?.name === "การใช้งาน",
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-0">
      {/* ─── Page Title ────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="cursor-pointer text-sm text-zinc-400 mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:text-zinc-200 hover:border-white/20 transition-all"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          กลับสู่หน้าแรก
        </button>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">ผลการวิเคราะห์สภาพเครื่อง</h1>
        <p className="text-zinc-500 mt-1.5">สรุปคะแนน คำแนะนำ และทางเลือกที่เหมาะสมที่สุดสำหรับอุปกรณ์ของคุณ</p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-950/40 via-slate-900/40 to-zinc-900/40 p-4 md:p-5 flex gap-3 items-start">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-cyan-200">หน้านี้แสดงอะไร?</p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              ระบบประเมินสภาพเครื่องของคุณจากข้อมูลที่กรอก แล้วคำนวณ
              <strong className="text-white">คะแนนหักข้อบกพร่อง</strong>ในแต่ละด้าน
              เพื่อจัดอันดับทางเลือกที่เหมาะสมที่สุด — ตั้งแต่อันดับ 1 (แนะนำ) เรียงลงไปจนถึงตัวเลือกสำรอง
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              ผลลัพธ์เป็นคำแนะนำเบื้องต้นเพื่อช่วยตัดสินใจ ไม่ใช่ข้อสรุปตายตัว
              หากสภาพเครื่องเปลี่ยนสามารถประเมินซ้ำได้ตลอดเวลา
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main 2-Column Layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* ─── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* ── Best Match Recommendation (TOP PRIORITY) ────────────────── */}
          {recommended && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 space-y-0">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="shrink-0 h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  {recommended.decisionPath.icon ? (
                    <DynamicIcon name={recommended.decisionPath.icon} className="w-6 h-6" />
                  ) : (
                    <Trophy className="w-6 h-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider mb-1">
                    อันดับ #1 — ทางเลือกที่เหมาะสมที่สุด
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-xl font-bold text-white">{recommended.decisionPath.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/90 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                      แนะนำ
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 leading-relaxed mt-2">{reasonText}</p>

                  <div className="flex items-center gap-4 mt-5">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                    >
                      {showDetails ? "ซ่อนรายละเอียด" : "ดูรายละเอียดคะแนนแต่ละหัวข้อ"}
                      <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Score */}
                <div className="shrink-0 text-right">
                  <p className={`text-4xl font-black tabular-nums ${getScoreColor(recommended.total_score)}`}>
                    {Math.round(recommended.total_score)}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">คะแนนรวม</p>
                </div>
              </div>

              {/* ── Condition Details (inline, right below button) ──── */}
              {showDetails && (
                <div className="mt-6 pt-6 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {physicalConditions.length > 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold text-white">สภาพกายภาพ</span>
                        <span className="text-[10px] text-zinc-600 ml-auto">คะแนนหักตามข้อบกพร่อง</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        {physicalConditions.map((ac) => (
                          <div key={ac.id} className="px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {ac.condition.icon && (
                                <DynamicIcon name={ac.condition.icon} className="w-4 h-4 text-zinc-500" />
                              )}
                              <span className="text-sm text-white">{ac.condition.name}</span>
                              <span className="text-xs text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
                                {ac.answerOption?.label || "N/A"}
                              </span>
                            </div>
                            <span className="text-sm text-red-400/70 tabular-nums">-{ac.final_score.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {functionalConditions.length > 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-semibold text-white">การทำงานของเครื่อง</span>
                        <span className="text-[10px] text-zinc-600 ml-auto">คะแนนหักตามข้อบกพร่อง</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        {functionalConditions.map((ac) => (
                          <div key={ac.id} className="px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {ac.condition.icon && (
                                <DynamicIcon name={ac.condition.icon} className="w-4 h-4 text-zinc-500" />
                              )}
                              <span className="text-sm text-white">{ac.condition.name}</span>
                              <span className="text-xs text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
                                {ac.answerOption?.label || "N/A"}
                              </span>
                            </div>
                            <span className="text-sm text-red-400/70 tabular-nums">-{ac.final_score.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Score Overview Card ──────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">ภาพรวมคะแนนตามหมวดหมู่</h2>
                  <p className="text-xs text-zinc-500">
                    {assessment.model.brand.name} {assessment.model.name}
                    {assessment.storage_gb > 0 &&
                      ` • ${assessment.storage_gb >= 1024 ? `${assessment.storage_gb / 1024} TB` : `${assessment.storage_gb} GB`}`}
                  </p>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  totalScore >= 80
                    ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-400/80"
                    : totalScore >= 60
                      ? "bg-sky-500/5 border-sky-500/15 text-sky-400/80"
                      : totalScore >= 40
                        ? "bg-amber-500/5 border-amber-500/15 text-amber-400/80"
                        : "bg-red-500/5 border-red-500/15 text-red-400/80"
                }`}
              >
                สถานะ: {getScoreLabel(totalScore)}
              </div>
            </div>

            {/* Score ring + bars */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ScoreRing score={totalScore} />
              <div className="flex-1 w-full space-y-4">
                <ScoreBar label="สภาพตัวเครื่อง" score={physicalScore} icon={<Shield className="w-4 h-4" />} />
                <ScoreBar label="การทำงานของระบบ" score={functionalScore} icon={<Cpu className="w-4 h-4" />} />
                <ScoreBar label="อายุเครื่อง" score={ageScore} icon={<Clock className="w-4 h-4" />} />
              </div>
            </div>
          </div>

          {/* ── Feedback ────────────────────────────────────────────────── */}
          <FeedbackForm assessmentId={assessment.id} existingFeedback={assessment.feedback?.[0]} />
        </div>

        {/* ─── RIGHT COLUMN — Other Paths ──────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-500" />
              ทางเลือกสำรอง
            </h2>
            <p className="text-[11px] text-zinc-600 mt-1 ml-6">เรียงตามคะแนนความเหมาะสมจากมากไปน้อย</p>
          </div>

          {otherPaths.map((ps) => (
            <div
              key={ps.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {ps.decisionPath.icon ? (
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                      <DynamicIcon name={ps.decisionPath.icon} className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500">
                      <span className="text-xs font-mono">#{ps.rank}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white text-sm">{ps.decisionPath.name}</h3>
                    <span className="text-[10px] text-zinc-500">อันดับ #{ps.rank}</span>
                  </div>
                </div>
                <p className={`text-2xl font-black tabular-nums ${getScoreColor(ps.total_score)}`}>
                  {Math.round(ps.total_score)}
                </p>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                ความเหมาะสม {Math.round(ps.total_score)}% —{" "}
                {ps.total_score >= 70
                  ? "เป็นทางเลือกที่น่าพิจารณา"
                  : ps.total_score >= 50
                    ? "เหมาะสมปานกลาง"
                    : "ความเหมาะสมต่ำ"}
              </p>

              <div className="flex gap-3 mt-3 text-[10px] text-zinc-600">
                <span>กายภาพ {Math.round(ps.score_physical)}</span>
                <span>•</span>
                <span>การทำงาน {Math.round(ps.score_functional)}</span>
                <span>•</span>
                <span>อายุเครื่อง {Math.round(ps.score_age)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Footer Disclaimer + Actions ───────────────────────────────── */}
      <div className="pt-10 pb-8 space-y-6">
        <div className="flex justify-center">
          <button
            onClick={() => {
              reset();
              router.push("/assessment/brand");
            }}
            className="cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            ประเมินเครื่องใหม่
          </button>
        </div>

        <p className="text-center text-xs text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          ผลลัพธ์นี้คำนวณจากข้อมูลที่คุณกรอกด้วยตนเอง (Self-Assessment) โดยใช้หลักการตัดสินใจแบบหลายเกณฑ์ (MCDM)
          เพื่อจัดอันดับทางเลือกจากเหมาะสมมากไปน้อย สภาพตลาดและสภาพเครื่องจริงอาจส่งผลให้ผลลัพธ์แตกต่างออกไป
          สามารถประเมินซ้ำได้ทุกเมื่อเพื่อผลลัพธ์ที่เป็นปัจจุบัน
        </p>
      </div>
    </div>
  );
}
