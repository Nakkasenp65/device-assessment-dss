import { api } from "@/lib/api";

export const getConditions = async () => {
  const res = await api.get("/conditions");
  return res.data.data;
};

export const getConditionCategories = async () => {
  const res = await api.get("/conditions/categories");
  return res.data.data;
};
