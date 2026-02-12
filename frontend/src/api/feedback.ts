import { api } from "@/lib/api";

export interface FeedbackData {
  assessment_id: number;
  rate: number;
  comment?: string;
}

export const submitFeedback = async (data: FeedbackData) => {
  const res = await api.post("/feedback", data);
  return res.data.data;
};
