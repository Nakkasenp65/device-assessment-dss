import { api } from "@/lib/api";

export const getModels = async () => {
  const res = await api.get("/models");
  return res.data.data;
};

export const createModel = async (model: {
  name: string;
  brand_id: number;
  release_year: number;
}) => {
  await api.post("/models", model);
};

export const deleteModel = async (id: number) => {
  await api.delete(`/models/${id}`);
};
