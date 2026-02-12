import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/api/auth";

export const useUser = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    // retry: false, // Maybe we don't want to retry if 401?
  });
};
