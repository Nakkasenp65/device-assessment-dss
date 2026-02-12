"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  release_year: number;
  brand_id: number;
}

interface Condition {
  id: number;
  name: string;
  category_id: number;
  answer_group_id: number;
  answer_type: string;
}

interface Answer {
  condition_id: number;
  answer_option_id: number;
  value?: string | number;
}

interface AssessmentState {
  selectedBrand: Brand | null;
  selectedModel: Model | null;
  storage_gb: number;
  answers: Record<number, Answer>; // condition_id -> Answer
}

interface AssessmentContextType {
  state: AssessmentState;
  setBrand: (brand: Brand) => void;
  setModel: (model: Model) => void;
  setStorageGb: (gb: number) => void;
  setAnswer: (conditionId: number, answer: Answer) => void;
  reset: () => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const AssessmentContext = createContext<AssessmentContextType | undefined>(
  undefined,
);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AssessmentState>({
    selectedBrand: null,
    selectedModel: null,
    storage_gb: 0,
    answers: {},
  });

  const setBrand = (brand: Brand) => {
    setState((prev) => ({
      ...prev,
      selectedBrand: brand,
      selectedModel: null,
      storage_gb: 0,
    }));
  };

  const setModel = (model: Model) => {
    setState((prev) => ({ ...prev, selectedModel: model }));
  };

  const setStorageGb = (gb: number) => {
    setState((prev) => ({ ...prev, storage_gb: gb }));
  };

  const setAnswer = (conditionId: number, answer: Answer) => {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [conditionId]: answer,
      },
    }));
  };

  const reset = () => {
    setState({
      selectedBrand: null,
      selectedModel: null,
      storage_gb: 0,
      answers: {},
    });
  };

  return (
    <AssessmentContext.Provider
      value={{ state, setBrand, setModel, setStorageGb, setAnswer, reset }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
}
