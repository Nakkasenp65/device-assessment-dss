"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SaatyScaleProps {
  value: number;
  onChange: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export function SaatyScale({ value, onChange, leftLabel, rightLabel, className }: SaatyScaleProps) {
  // Scale points: 9 7 5 3 1 3 5 7 9
  // Mapped to internal value: -8 -6 -4 -2 0 2 4 6 8
  // actually Saaty uses 1-9.
  // Let's use internal value range as: -8 to 8
  // 0 = 1
  // +/- 2 = 3
  // +/- 4 = 5
  // +/- 6 = 7
  // +/- 8 = 9
  // Step is 1, but we only show labels for odd saaty numbers mostly?
  // The design shows circles. Let's make clickable circles.

  const points = [
    { val: -8, label: "9" },
    { val: -7, label: "" },
    { val: -6, label: "7" },
    { val: -5, label: "" },
    { val: -4, label: "5" },
    { val: -3, label: "" },
    { val: -2, label: "3" },
    { val: -1, label: "" },
    { val: 0, label: "1" },
    { val: 1, label: "" },
    { val: 2, label: "3" },
    { val: 3, label: "" },
    { val: 4, label: "5" },
    { val: 5, label: "" },
    { val: 6, label: "7" },
    { val: 7, label: "" },
    { val: 8, label: "9" },
  ];

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex justify-between text-sm font-medium text-muted-foreground">
        <span className={cn("transition-colors", value < 0 && "text-primary font-bold")}>{leftLabel}</span>
        <span className={cn("transition-colors", value > 0 && "text-primary font-bold")}>{rightLabel}</span>
      </div>

      <div className="relative flex items-center justify-between">
        {/* Line behind */}
        <div className="absolute left-0 right-0 h-0.5 bg-border -z-10" />

        {points.map((p) => {
          const isSelected = value === p.val;
          // Larger circles for main numbers (1, 3, 5, 7, 9) i.e. even indices in our array logic?
          // -8(9), -6(7), -4(5), -2(3), 0(1) ...
          const isMain = p.val % 2 === 0;

          return (
            <div key={p.val} className="relative flex flex-col items-center group">
              <button
                type="button"
                onClick={() => onChange(p.val)}
                className={cn(
                  "rounded-full border-2 transition-all duration-200 flex items-center justify-center bg-card",
                  isMain ? "w-10 h-10" : "w-4 h-4",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground w-12 h-12 shadow-lg shadow-primary/50 z-10"
                    : "border-muted text-muted-foreground hover:border-primary/50",
                )}
              >
                {p.label && <span className={cn("text-xs font-bold", isSelected && "text-base")}>{p.label}</span>}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground pt-2">
        <span>Left is more important</span>
        <span>Right is more important</span>
      </div>
    </div>
  );
}
