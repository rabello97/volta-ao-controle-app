import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInstallmentPlan,
  deleteInstallmentPlan,
  listInstallmentPlans,
  updateInstallmentPlan,
  type InstallmentPlanInput,
} from "@/api/installments";

/** Um parcelamento é feito de transações, então mexer nele move o painel,
 *  a lista de transações e as faturas. */
function useInvalidateInstallments() {
  const queryClient = useQueryClient();
  return () => {
    for (const key of ["installments", "transactions", "dashboard", "budget-status", "credit-cards", "upcoming-due"]) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };
}

export function useInstallmentPlans(scope?: string) {
  return useQuery({
    queryKey: ["installments", scope ?? "self"],
    queryFn: () => listInstallmentPlans(scope),
  });
}

export function useCreateInstallmentPlan() {
  const invalidate = useInvalidateInstallments();
  return useMutation({ mutationFn: (input: InstallmentPlanInput) => createInstallmentPlan(input), onSuccess: invalidate });
}

export function useUpdateInstallmentPlan() {
  const invalidate = useInvalidateInstallments();
  return useMutation({
    mutationFn: ({ groupId, input }: { groupId: string; input: { description?: string; category?: string } }) =>
      updateInstallmentPlan(groupId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteInstallmentPlan() {
  const invalidate = useInvalidateInstallments();
  return useMutation({ mutationFn: (groupId: string) => deleteInstallmentPlan(groupId), onSuccess: invalidate });
}
