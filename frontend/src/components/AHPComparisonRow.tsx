"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AHPComparisonRowProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (val: number) => void;
  index: number;
}

const STEPS = [
  { val: 9, label: "9", side: "left" },
  { val: 7, label: "7", side: "left" },
  { val: 5, label: "5", side: "left" },
  { val: 3, label: "3", side: "left" },
  { val: 1, label: "1", side: "center" },
  { val: 3, label: "3", side: "right" },
  { val: 5, label: "5", side: "right" },
  { val: 7, label: "7", side: "right" },
  { val: 9, label: "9", side: "right" },
];

export function AHPComparisonRow({
  leftLabel,
  rightLabel,
  value,
  onChange,
  index,
}: AHPComparisonRowProps) {
  const getStepIndex = (val: number) => {
    if (val >= 1) {
      if (val === 1) return 4;
      if (val > 1) {
        if (val === 9) return 0;
        if (val === 7) return 1;
        if (val === 5) return 2;
        if (val === 3) return 3;
      }
    } else {
      const rVal = Math.round(1 / val);
      if (rVal === 3) return 5;
      if (rVal === 5) return 6;
      if (rVal === 7) return 7;
      if (rVal === 9) return 8;
    }
    return 4; // fallback
  };

  const selectedIdx = getStepIndex(value);

  const handleSelect = (idx: number) => {
    const step = STEPS[idx];
    let newVal = 1;
    if (step.side === "left") newVal = step.val;
    else if (step.side === "right") newVal = 1 / step.val;
    else newVal = 1;

    onChange(newVal);
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50" />
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold ring-1 ring-cyan-500/50">
            {index + 1}
          </span>
          <h3 className="text-lg font-semibold text-white">
            {leftLabel} vs. {rightLabel}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-500 block uppercase tracking-wider">
            ค่าน้ำหนักปัจจุบัน
          </span>
          <span className="text-xl font-bold text-white">
            {value >= 1 ? `${value} : 1` : `1 : ${Math.round(1 / value)}`}
          </span>
        </div>
      </div>

      {/* Scale */}
      <div className="relative pt-4 pb-2 px-4">
        {/* Labels */}
        <div className="flex justify-between text-sm font-medium text-cyan-400 mb-6 px-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>

        {/* Track Line */}
        <div className="relative flex justify-between items-center z-10">
          {/* The line itself */}
          <div className="absolute left-0 right-0 h-0.5 bg-zinc-800 top-1/2 -translate-y-1/2 -z-10" />

          {STEPS.map((step, i) => {
            const isSelected = i === selectedIdx;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                className={cn(
                  "relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900",
                  isSelected
                    ? "bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.6)] scale-110 z-20"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-cyan-500 hover:text-cyan-400 z-0",
                )}
              >
                {step.label}
                {isSelected && (
                  <motion.div
                    layoutId={`glow-${index}`}
                    className="absolute inset-0 rounded-full bg-cyan-500 opacity-20 blur-md pointer-events-none"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Helper Text */}
        <div className="flex justify-between text-xs text-zinc-500 mt-6 px-1">
          <span>เน้นซ้าย</span>
          <span className="opacity-50">เท่ากัน</span>
          <span>เน้นขวา</span>
        </div>
      </div>
    </div>
  );
}
