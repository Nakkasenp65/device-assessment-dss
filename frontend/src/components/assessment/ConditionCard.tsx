"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DynamicIcon } from "@/components/DynamicIcon";

interface AnswerOption {
  id: number;
  label: string;
  default_ratio: number;
}

interface AnswerGroup {
  id: number;
  name: string;
  answerOptions: AnswerOption[];
}

interface Condition {
  id: number;
  name: string;
  answer_type: string;
  icon?: string;
  answerGroup: AnswerGroup;
}

interface ConditionCardProps {
  condition: Condition;
  value?: string | number;
  onChange: (value: string | number, isInput?: boolean) => void;
}

export function ConditionCard({
  condition,
  value,
  onChange,
}: ConditionCardProps) {
  const isInput = condition.answer_type === "input";
  const options = condition.answerGroup?.answerOptions ?? [];

  // Yes/No toggle: answer groups with exactly 2 options
  const isBinaryToggle = !isInput && options.length === 2;

  // For binary toggles, sort by default_ratio ascending:
  //   [0] = "working fine" (low severity), [1] = "broken" (high severity)
  const sortedOptions = isBinaryToggle
    ? [...options].sort((a, b) => a.default_ratio - b.default_ratio)
    : options;

  const handleSwitchChange = (checked: boolean) => {
    const selectedOption = checked ? sortedOptions[1] : sortedOptions[0];
    if (selectedOption) {
      onChange(selectedOption.id, false);
    }
  };

  const isSwitchChecked =
    isBinaryToggle &&
    sortedOptions[1] &&
    value?.toString() === sortedOptions[1].id.toString();

  return (
    <div className="px-4 py-3 bg-card border border-border rounded-lg transition-colors hover:border-white/15">
      {isBinaryToggle ? (
        <div className="flex items-center justify-between gap-3">
          {condition.icon && (
            <div className="shrink-0 h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
              <DynamicIcon name={condition.icon} className="h-4 w-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-card-foreground leading-tight">
              {condition.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {isSwitchChecked
                ? sortedOptions[1]?.label
                : sortedOptions[0]?.label}
            </p>
          </div>
          <Switch
            checked={isSwitchChecked}
            onCheckedChange={handleSwitchChange}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2.5">
            {condition.icon && (
              <div className="shrink-0 h-6 w-6 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground">
                <DynamicIcon name={condition.icon} className="h-3.5 w-3.5" />
              </div>
            )}
            <h3 className="font-medium text-sm text-card-foreground leading-tight">
              {condition.name}
            </h3>
          </div>

          {isInput ? (
            <div className="max-w-xs">
              <Input
                type="number"
                placeholder="กรอกค่า"
                onChange={(e) => onChange(e.target.value, true)}
                value={value || ""}
                className="h-9 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                กรอกค่าตามที่แสดงบนอุปกรณ์
              </p>
            </div>
          ) : (
            <RadioGroup
              onValueChange={(val) => onChange(val, false)}
              className="grid grid-cols-2 gap-2"
              value={value?.toString()}
            >
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className={`
                    relative flex items-center px-3 py-2 rounded-md border cursor-pointer transition-all text-sm
                    ${
                      value?.toString() === opt.id.toString()
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/30 text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/60"
                    }
                  `}
                  onClick={() => onChange(opt.id, false)}
                >
                  <RadioGroupItem
                    value={opt.id.toString()}
                    id={`c-${condition.id}-o-${opt.id}`}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`c-${condition.id}-o-${opt.id}`}
                    className="flex-1 cursor-pointer font-medium text-sm pointer-events-none"
                  >
                    {opt.label}
                  </label>
                </div>
              )) || (
                <div className="text-red-500 text-sm">
                  No options configured.
                </div>
              )}
            </RadioGroup>
          )}
        </>
      )}
    </div>
  );
}
