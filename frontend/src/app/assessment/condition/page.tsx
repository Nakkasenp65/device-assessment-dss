"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConditions } from "@/hooks/useConditions";
import { useSubmitAssessment } from "@/hooks/useAssessments";
import { useAssessment } from "@/context/AssessmentContext";
import { ConditionCard } from "@/components/assessment/ConditionCard";
import { ConditionIconToggle } from "@/components/assessment/ConditionIconToggle";
import { Smartphone, Wrench, ArrowLeft, ArrowRight, BadgeAlert } from "lucide-react";

interface CategorizedConditions {
  Physical: any[];
  Functional: any[];
}

// ─── Input → AnswerOption Mapping ───────────────────────────────────────────
function mapInputToOptionId(
  inputValue: string | number,
  answerOptions: { id: number; default_ratio: number }[],
): number {
  if (!answerOptions || answerOptions.length === 0) return 0;

  const numericInput = Number(inputValue);
  const clamped = Math.max(0, Math.min(100, isNaN(numericInput) ? 0 : numericInput));
  const severity = 1 - clamped / 100;

  let bestOption = answerOptions[0]!;
  let bestDiff = Math.abs(bestOption.default_ratio - severity);

  for (const opt of answerOptions) {
    const diff = Math.abs(opt.default_ratio - severity);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestOption = opt;
    }
  }

  return bestOption.id;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isBinaryCondition(c: any): boolean {
  const opts = c.answerGroup?.answerOptions ?? [];
  return c.answer_type !== "input" && opts.length === 2;
}

function getSortedOptions(c: any) {
  const opts = c.answerGroup?.answerOptions ?? [];
  return [...opts].sort((a: any, b: any) => a.default_ratio - b.default_ratio);
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function UnifiedAssessmentPage() {
  const { data: allConditions = [], isLoading } = useConditions();
  const [categorized, setCategorized] = useState<CategorizedConditions>({
    Physical: [],
    Functional: [],
  });
  const [defaultsSet, setDefaultsSet] = useState(false);

  const { state, setAnswer } = useAssessment();
  const router = useRouter();
  const submitMutation = useSubmitAssessment();

  useEffect(() => {
    if (!state.selectedModel) {
      router.push("/assessment/brand");
    }
  }, [state.selectedModel, router]);

  useEffect(() => {
    if (allConditions.length > 0) {
      const physical = allConditions.filter(
        (c: any) => c.category?.name === "Physical" || c.category?.name === "สภาพตัวเครื่อง" || c.category_id === 1,
      );
      const functional = allConditions.filter(
        (c: any) => c.category?.name === "Functional" || c.category?.name === "การใช้งาน" || c.category_id === 2,
      );
      setCategorized({ Physical: physical, Functional: functional });
    }
  }, [allConditions]);

  // ─── Separate binary from multi-option ──────────────────────────────────
  const { physicalBinary, physicalMulti, functionalBinary, functionalMulti } = useMemo(
    () => ({
      physicalBinary: categorized.Physical.filter(isBinaryCondition),
      physicalMulti: categorized.Physical.filter((c) => !isBinaryCondition(c)),
      functionalBinary: categorized.Functional.filter(isBinaryCondition),
      functionalMulti: categorized.Functional.filter((c) => !isBinaryCondition(c)),
    }),
    [categorized],
  );

  // ─── Auto-default binary conditions to "no problem" ─────────────────────
  useEffect(() => {
    if (defaultsSet) return;
    const allBinary = [...physicalBinary, ...functionalBinary];
    if (allBinary.length === 0) return;

    allBinary.forEach((condition) => {
      if (!state.answers[condition.id]) {
        const sorted = getSortedOptions(condition);
        if (sorted[0]) {
          setAnswer(condition.id, {
            condition_id: condition.id,
            answer_option_id: sorted[0].id,
            value: sorted[0].id,
          });
        }
      }
    });
    setDefaultsSet(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [physicalBinary, functionalBinary]);

  // ─── Toggle helpers ─────────────────────────────────────────────────────
  const isConditionProblem = (condition: any) => {
    const sorted = getSortedOptions(condition);
    const problemId = sorted[1]?.id;
    const currentId = state.answers[condition.id]?.answer_option_id;
    return currentId !== undefined && Number(currentId) === Number(problemId);
  };

  const toggleCondition = (condition: any) => {
    const sorted = getSortedOptions(condition);
    const isProblem = isConditionProblem(condition);
    const newOption = isProblem ? sorted[0] : sorted[1];
    if (newOption) {
      handleAnswerChange(condition.id, newOption.id, false);
    }
  };

  // ─── Answer change handler ──────────────────────────────────────────────
  const handleAnswerChange = (conditionId: number, value: string | number, isInput = false) => {
    if (isInput) {
      setAnswer(conditionId, {
        condition_id: conditionId,
        answer_option_id: -1,
        value: value,
      });
    } else {
      setAnswer(conditionId, {
        condition_id: conditionId,
        answer_option_id: Number(value),
        value: value,
      });
    }
  };

  // ─── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const resolvedAnswers = Object.values(state.answers).map((a) => {
        let optionId = a.answer_option_id;

        if (optionId === -1 && a.value !== undefined) {
          const allConds = [...categorized.Physical, ...categorized.Functional];
          const condition = allConds.find((c) => c.id === a.condition_id);

          if (condition?.answerGroup?.answerOptions) {
            optionId = mapInputToOptionId(a.value, condition.answerGroup.answerOptions);
          }
        }

        return {
          condition_id: a.condition_id,
          answer_option_id: optionId,
        };
      });

      const payload = {
        model_id: state.selectedModel!.id,
        storage_gb: state.storage_gb,
        answers: resolvedAnswers,
      };

      submitMutation.mutate(payload, {
        onSuccess: (res) => {
          const assessmentId = res.data.data.id;
          router.push(`/assessment/result?id=${assessmentId}`);
        },
        onError: (error) => {
          console.error("Submission failed", error);
          alert("Failed to submit assessment. Please try again.");
        },
      });
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  // ─── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-zinc-400">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col pt-10">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="shrink-0 px-8 py-5 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">ประเมินสภาพอุปกรณ์</h1>
            <p className="text-sm text-zinc-500 mt-1">ตรวจสอบสภาพเครื่องและกดเลือกหากพบปัญหา</p>
          </div>
          {state.selectedModel && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>{state.selectedModel.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Scrollable content ─────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
          {/* ─── Physical Section ─── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">สภาพกายภาพ</h2>
                <p className="text-xs text-zinc-500">{categorized.Physical.length} รายการ</p>
              </div>
            </div>

            {/* Multi-option cards (grade conditions) */}
            {physicalMulti.length > 0 && (
              <div className="space-y-3 mb-6">
                {physicalMulti.map((condition) => (
                  <ConditionCard
                    key={condition.id}
                    condition={condition}
                    value={state.answers[condition.id]?.value}
                    onChange={(val, isInput) => handleAnswerChange(condition.id, val, isInput)}
                  />
                ))}
              </div>
            )}

            {/* Binary icon toggles */}
            {physicalBinary.length > 0 && (
              <div>
                <p className="flex text-base text-amber-300 mb-3">
                  <BadgeAlert className="inline-block mr-2" />
                  เลือกเฉพาะข้อที่ไม่สามารถใช้งานได้ตามปกติ
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {physicalBinary.map((condition) => (
                    <ConditionIconToggle
                      key={condition.id}
                      name={condition.name}
                      icon={condition.icon}
                      isActive={isConditionProblem(condition)}
                      onToggle={() => toggleCondition(condition)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ─── Functional Section ─── */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">การทำงาน</h2>
                <p className="text-xs text-zinc-500">{categorized.Functional.length} รายการ</p>
              </div>
            </div>

            {/* Multi-option cards */}
            {functionalMulti.length > 0 && (
              <div className="space-y-3 mb-6">
                {functionalMulti.map((condition) => (
                  <ConditionCard
                    key={condition.id}
                    condition={condition}
                    value={state.answers[condition.id]?.value}
                    onChange={(val, isInput) => handleAnswerChange(condition.id, val, isInput)}
                  />
                ))}
              </div>
            )}

            {/* Binary icon toggles */}
            {functionalBinary.length > 0 && (
              <div>
                <p className="flex text-base text-amber-300 mb-3">
                  <BadgeAlert className="inline-block mr-2" />
                  เลือกเฉพาะข้อที่ไม่สามารถใช้งานได้ตามปกติ
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {functionalBinary.map((condition) => (
                    <ConditionIconToggle
                      key={condition.id}
                      name={condition.name}
                      icon={condition.icon}
                      isActive={isConditionProblem(condition)}
                      onToggle={() => toggleCondition(condition)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ─── Action Bar ─────────────────────────────────── */}
      <div className="shrink-0 px-8 py-4 border-t border-white/10 bg-[#0a0e1a]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/assessment/brand")}
            className="cursor-pointer flex items-center gap-2 px-5 py-2.5 text-zinc-400 font-medium hover:text-white transition-colors rounded-lg hover:bg-white/5"
            disabled={submitMutation.isPending}
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitMutation.isPending ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <span>กำลังวิเคราะห์...</span>
              </>
            ) : (
              <>
                <span>วิเคราะห์ผลการประเมิน</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
