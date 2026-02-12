import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBrands,
  createBrand,
  deleteBrand,
  getModelsByBrand,
} from "@/api/brands";

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      // Consider triggering toast here too, but for now just invalidate
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useBrandModels = (brandId?: number) => {
  return useQuery({
    queryKey: ["brands", brandId, "models"],
    queryFn: () => getModelsByBrand(brandId!),
    enabled: !!brandId,
    staleTime: 1000 * 60 * 5,
  });
};
