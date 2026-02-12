import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyAssessments, submitAssessment } from "@/api/assessments";

export const useAssessments = () => {
  return useQuery({
    queryKey: ["my-assessments"],
    queryFn: getMyAssessments,
  });
};

export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-assessments"] });
    },
  });
};
