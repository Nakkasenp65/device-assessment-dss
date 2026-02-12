"use client";

import { useState, use, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AHPComparisonRow } from "@/components/AHPComparisonRow";
import { AhpCalculator } from "@/lib/ahp";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  GitMerge,
} from "lucide-react";
import { toast } from "sonner";
import { PathForm } from "@/app/admin/paths/PathForm";
import { DynamicIcon } from "@/components/DynamicIcon";

export default function AhpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [valPF, setValPF] = useState(1); // Physical vs Functional
  const [valPA, setValPA] = useState(1); // Physical vs Age
  const [valFA, setValFA] = useState(1); // Functional vs Age

  const [result, setResult] = useState<any>(null);

  // Fetch current path to show name/details
  const {
    data: pathData,
    isLoading: isPathLoading,
    isError,
  } = useQuery({
    queryKey: ["decision-path", id],
    queryFn: async () => {
      const res = await api.get(`/paths/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const updatePathMutation = useMutation({
    mutationFn: async (values: any) => {
      const { weight_physical, weight_functional, weight_age, ...rest } =
        values;
      await api.put(`/paths/${id}`, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision-path", id] });
      queryClient.invalidateQueries({ queryKey: ["decision-paths"] });
      toast.success("อัปเดตข้อมูลเส้นทางสำเร็จ");
      setStep(2);
    },
    onError: () => toast.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล"),
  });

  const saveWeightsMutation = useMutation({
    mutationFn: async () => {
      if (!result) return;
      await api.put(`/paths/${id}`, {
        weight_physical: result.weights[0],
        weight_functional: result.weights[1],
        weight_age: result.weights[2],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision-paths"] });
      toast.success("บันทึกค่าน้ำหนัก AHP เรียบร้อยแล้ว");
      router.push("/admin/paths");
    },
    onError: () => toast.error("เกิดข้อผิดพลาดในการบันทึกค่าน้ำหนัก"),
  });

  // Calculate whenever inputs change
  useEffect(() => {
    if (step === 2) {
      const m = [
        [1, valPF, valPA],
        [1 / valPF, 1, valFA],
        [1 / valPA, 1 / valFA, 1],
      ];
      const res = AhpCalculator.calculate(m);
      setResult(res);
    }
  }, [valPF, valPA, valFA, step]);

  if (isPathLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (isError || !pathData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertTriangle className="w-12 h-12 text-zinc-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          ไม่พบข้อมูลเส้นทาง
        </h3>
        <p className="text-zinc-500 mb-6">
          ไม่สามารถโหลดข้อมูลเส้นทางได้ หรือเส้นทางนี้อาจถูกลบไปแล้ว
        </p>
        <Button onClick={() => router.back()} variant="outline">
          กลับไปหน้าจัดการ
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent text-zinc-400 hover:text-white mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้าจัดการเส้นทาง
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-800 rounded-lg flex items-center justify-center text-cyan-500">
              {pathData.icon ? (
                <DynamicIcon name={pathData.icon} className="w-6 h-6" />
              ) : (
                <GitMerge className="w-6 h-6" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {pathData.name} ({pathData.code})
              </h1>
              <p className="text-zinc-500 mt-1">
                กำหนดรายละเอียดเส้นทางและค่าน้ำหนักความสำคัญ (AHP Configuration)
              </p>
            </div>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-2 rounded-full">
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${step === 1 ? "bg-cyan-500 text-white" : "text-zinc-500 hover:text-zinc-300 cursor-pointer"}`}
            onClick={() => setStep(1)}
          >
            1. ข้อมูลทั่วไป
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-700" />
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${step === 2 ? "bg-cyan-500 text-white" : "text-zinc-500 hover:text-zinc-300 cursor-pointer"}`}
            onClick={() => setStep(2)}
          >
            2. กำหนดน้ำหนัก AHP
          </div>
        </div>
      </div>

      {/* Current Weights Summary */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <p className="text-zinc-500 text-xs uppercase font-medium">
                น้ำหนักกายภาพ (Physical)
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {(pathData.weight_physical * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <p className="text-zinc-500 text-xs uppercase font-medium">
                น้ำหนักการใช้งาน (Functional)
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {(pathData.weight_functional * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <p className="text-zinc-500 text-xs uppercase font-medium">
                น้ำหนักอายุ (Age)
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {(pathData.weight_age * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">แก้ไขข้อมูลพื้นฐาน</CardTitle>
            <CardDescription className="text-zinc-500">
              ปรับปรุงชื่อ รหัส และคำอธิบายสำหรับเส้นทางนี้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PathForm
              initialData={pathData}
              onSubmit={(values) => updatePathMutation.mutate(values)}
              isLoading={updatePathMutation.isPending}
              hideWeights={true}
              submitLabel="บันทึกและไปต่อ"
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2: AHP Comparisons */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> กลับไปแก้ไขข้อมูล
            </Button>

            <div className="flex items-center gap-3">
              {result && (
                <div
                  className={`flex items-center px-3 py-1.5 rounded-full text-sm font-bold border ${
                    result.cr <= 0.1
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}
                >
                  {result.cr <= 0.1 ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mr-2" />
                  )}
                  CR: {result.cr.toFixed(4)} ({result.consistencyStatus})
                </div>
              )}
              <Button
                onClick={() => saveWeightsMutation.mutate()}
                disabled={
                  !result || result.cr > 0.1 || saveWeightsMutation.isPending
                }
                className="bg-cyan-500 hover:bg-cyan-600 text-white min-w-[160px] shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                {saveWeightsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> บันทึก...
                  </>
                ) : (
                  "บันทึกค่าน้ำหนัก"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <AHPComparisonRow
              index={0}
              leftLabel="สภาพภายนอก"
              rightLabel="การใช้งาน"
              value={valPF}
              onChange={setValPF}
            />
            <AHPComparisonRow
              index={1}
              leftLabel="สภาพภายนอก"
              rightLabel="อายุอุปกรณ์"
              value={valPA}
              onChange={setValPA}
            />
            <AHPComparisonRow
              index={2}
              leftLabel="การใช้งาน"
              rightLabel="อายุอุปกรณ์"
              value={valFA}
              onChange={setValFA}
            />
          </div>

          {/* Results Preview */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-800">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-sm font-medium text-zinc-400 uppercase">
                    Weight: User Physical
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <p className="text-4xl font-bold text-white">
                    {(result.weights[0] * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-sm font-medium text-zinc-400 uppercase">
                    Weight: Functional
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <p className="text-4xl font-bold text-white">
                    {(result.weights[1] * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-sm font-medium text-zinc-400 uppercase">
                    Weight: Device Age
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <p className="text-4xl font-bold text-white">
                    {(result.weights[2] * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
