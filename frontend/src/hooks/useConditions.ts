import { useQuery } from "@tanstack/react-query";
import { getConditions } from "@/api/conditions";

export const useConditions = () => {
  return useQuery({
    queryKey: ["conditions"],
    queryFn: getConditions,
    staleTime: 1000 * 60 * 5, // 5 minutes (INTJ optimization: don't refetch too much)
  });
};
