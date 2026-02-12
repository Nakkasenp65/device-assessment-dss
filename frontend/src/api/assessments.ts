import { api } from "@/lib/api";

export const getMyAssessments = async () => {
  const res = await api.get("/assessments/my-assessments");
  return res.data.data;
};

export const submitAssessment = async (data: any) => {
  return api.post("/assessments", data);
};
