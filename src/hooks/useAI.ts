import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateMonthlyInsight, getAIStatus, getMonthlyInsight, scanImage } from "@/api/ai";

/** Se o servidor não tiver chave da IA, os botões nem aparecem. */
export function useAIStatus() {
  return useQuery({ queryKey: ["ai-status"], queryFn: getAIStatus, staleTime: 1000 * 60 * 60 });
}

export function useMonthlyInsight(scope?: string, enabled = true) {
  return useQuery({
    queryKey: ["monthly-insight", scope ?? "self"],
    queryFn: () => getMonthlyInsight(scope),
    enabled,
  });
}

export function useGenerateMonthlyInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scope?: string) => generateMonthlyInsight(scope),
    onSuccess: (data, scope) => {
      queryClient.setQueryData(["monthly-insight", scope ?? "self"], data);
    },
  });
}

export function useScanImage() {
  return useMutation({
    mutationFn: ({ imageBase64, mediaType }: { imageBase64: string; mediaType: string }) =>
      scanImage(imageBase64, mediaType),
  });
}
