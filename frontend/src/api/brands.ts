import { api } from "@/lib/api";

export const getBrands = async () => {
  const res = await api.get("/brands");
  return res.data.data;
};

export const createBrand = async (name: string) => {
  await api.post("/brands", { name });
};

export const deleteBrand = async (id: number) => {
  await api.delete(`/brands/${id}`);
};

export const getModelsByBrand = async (brandId: number) => {
  const res = await api.get(`/brands/${brandId}`);
  return res.data.data.models || [];
};
