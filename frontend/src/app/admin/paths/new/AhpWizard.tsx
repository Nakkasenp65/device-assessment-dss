"use client";

import { useState } from "react";
import { PathForm } from "../PathForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AhpCalculator } from "@/lib/ahp";
import { AHPComparisonRow } from "@/components/AHPComparisonRow";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface AhpWizardProps {
  onSave: (data: any) => void;
  isLoading: boolean;
}

export function AhpWizard({ onSave, isLoading }: AhpWizardProps) {
  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<any>({});

  // Matrix for 3 criteria: [Physical(0), Functional(1), Age(2)]
  const [comparisons, setComparisons] = useState({
    "0-1": 1, // Phy vs Func
    "0-2": 1, // Phy vs Age
    "1-2": 1, // Func vs Age
  });

  const [results, setResults] = useState<{
    weights: number[];
    cr: number;
    consistencyStatus: string;
  } | null>(null);

  const handleBasicInfoSubmit = (values: any) => {
    setBasicInfo(values);
    setStep(2);
  };

  const updateComparison = (key: "0-1" | "0-2" | "1-2", val: number) => {
    setComparisons((prev) => ({ ...prev, [key]: val }));
  };

  const calculateResults = () => {
    const m = [
      [1, comparisons["0-1"], comparisons["0-2"]],
      [1 / comparisons["0-1"], 1, comparisons["1-2"]],
      [1 / comparisons["0-2"], 1 / comparisons["1-2"], 1],
    ];

    const res = AhpCalculator.calculate(m);
    setResults(res);
  };

  const handleFinalSave = () => {
    if (!results) return;

    const finalData = {
      ...basicInfo,
      weight_physical: results.weights[0],
      weight_functional: results.weights[1],
      weight_age: results.weights[2],
    };
    onSave(finalData);
  };

  // Step 2 Render: Pairwise Comparisons
  if (step === 2) {
    const liveResults = (() => {
      const m = [
        [1, comparisons["0-1"], comparisons["0-2"]],
        [1 / comparisons["0-1"], 1, comparisons["1-2"]],
        [1 / comparisons["0-2"], 1 / comparisons["1-2"], 1],
      ];
      return AhpCalculator.calculate(m);
    })();

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            ขั้นตอนที่ 2: กำหนดความสำคัญ (AHP)
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold border ${
                liveResults.cr > 0.1
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              }`}
            >
              CR: {liveResults.cr.toFixed(2)} ({liveResults.consistencyStatus})
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <AHPComparisonRow
            index={0}
            leftLabel="สภาพภายนอก"
            rightLabel="การใช้งาน"
            value={comparisons["0-1"]}
            onChange={(v) => updateComparison("0-1", v)}
          />
          <AHPComparisonRow
            index={1}
            leftLabel="สภาพภายนอก"
            rightLabel="อายุอุปกรณ์"
            value={comparisons["0-2"]}
            onChange={(v) => updateComparison("0-2", v)}
          />
          <AHPComparisonRow
            index={2}
            leftLabel="การใช้งาน"
            rightLabel="อายุอุปกรณ์"
            value={comparisons["1-2"]}
            onChange={(v) => updateComparison("1-2", v)}
          />
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(1)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
          </Button>
          <Button
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
            onClick={() => {
              setResults(liveResults);
              setStep(3);
            }}
          >
            ถัดไป: ตรวจสอบ <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Review
  if (step === 3 && results) {
    return (
      <div className="space-y-6 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">พร้อมสร้างเส้นทาง</h2>
          <p className="text-zinc-500">
            ตรวจสอบน้ำหนักที่คำนวณได้จากการเปรียบเทียบของคุณ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-center text-zinc-400 text-sm font-medium uppercase">
                สภาพภายนอก
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-4xl font-bold text-white">
              {(results.weights[0] * 100).toFixed(1)}%
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-center text-zinc-400 text-sm font-medium uppercase">
                การใช้งาน
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-4xl font-bold text-white">
              {(results.weights[1] * 100).toFixed(1)}%
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-center text-zinc-400 text-sm font-medium uppercase">
                อายุอุปกรณ์
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-4xl font-bold text-white">
              {(results.weights[2] * 100).toFixed(1)}%
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(2)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
          </Button>
          <Button
            onClick={handleFinalSave}
            disabled={isLoading}
            size="lg"
            className="px-8 bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                สร้างเส้นทาง <Save className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: Basic Info
  return (
    <Card className="bg-zinc-900 border-zinc-800 text-white">
      <CardHeader>
        <CardTitle className="text-white">
          ขั้นตอนที่ 1: ข้อมูลพื้นฐาน
        </CardTitle>
        <CardDescription className="text-zinc-500">
          ระบุชื่อและรหัสสำหรับเส้นทางตัดสินใจ
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* We reuse PathForm but intercept submission to go to next step */}
        <PathForm
          initialData={basicInfo}
          onSubmit={handleBasicInfoSubmit}
          hideWeights={true}
          submitLabel="ถัดไป"
        />
      </CardContent>
    </Card>
  );
}
