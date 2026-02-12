import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getModels, createModel, deleteModel } from "@/api/models";

export const useModels = () => {
  return useQuery({
    queryKey: ["models"],
    queryFn: getModels,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });
};
