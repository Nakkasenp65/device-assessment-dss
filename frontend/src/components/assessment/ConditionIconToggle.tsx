"use client";

import { DynamicIcon } from "@/components/DynamicIcon";
import { HelpCircle } from "lucide-react";

interface ConditionIconToggleProps {
  name: string;
  icon?: string;
  isActive: boolean;
  onToggle: () => void;
}

export function ConditionIconToggle({
  name,
  icon,
  isActive,
  onToggle,
}: ConditionIconToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        group flex flex-col items-center gap-2 p-3 rounded-xl
        transition-all duration-200 cursor-pointer select-none
        ${
          isActive
            ? "bg-amber-500/10 ring-1 ring-amber-500/30"
            : "bg-white/[0.02] hover:bg-white/[0.05]"
        }
      `}
    >
      <div
        className={`
          h-12 w-12 rounded-full flex items-center justify-center
          transition-all duration-200
          ${
            isActive
              ? "bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/10"
              : "bg-white/5 text-zinc-600 group-hover:text-zinc-400 group-hover:bg-white/10"
          }
        `}
      >
        {icon ? (
          <DynamicIcon name={icon} className="h-5 w-5" />
        ) : (
          <HelpCircle className="h-5 w-5" />
        )}
      </div>
      <span
        className={`
          text-xs font-medium text-center leading-tight max-w-full
          transition-colors duration-200
          ${isActive ? "text-amber-300" : "text-zinc-500"}
        `}
      >
        {name}
      </span>
      {isActive && (
        <span className="text-[10px] text-amber-400/80 font-medium">
          มีปัญหา
        </span>
      )}
    </button>
  );
}
