import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteBudget,
  getBudgetStatus,
  listBudgets,
  setMonthlyIncome,
  upsertBudget,
} from "@/api/budgets";

function useInvalidateBudget() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["budgets"] });
    queryClient.invalidateQueries({ queryKey: ["budget-status"] });
  };
}

export function useBudgets(scope?: string) {
  return useQuery({ queryKey: ["budgets", scope ?? "self"], queryFn: () => listBudgets(scope) });
}

export function useBudgetStatus(scope?: string, month?: string) {
  return useQuery({
    queryKey: ["budget-status", scope ?? "self", month ?? "atual"],
    queryFn: () => getBudgetStatus(scope, month),
  });
}

export function useUpsertBudget() {
  const invalidate = useInvalidateBudget();
  return useMutation({
    mutationFn: ({ category, monthlyLimit }: { category: string; monthlyLimit: number }) =>
      upsertBudget(category, monthlyLimit),
    onSuccess: invalidate,
  });
}

export function useDeleteBudget() {
  const invalidate = useInvalidateBudget();
  return useMutation({ mutationFn: (id: string) => deleteBudget(id), onSuccess: invalidate });
}

export function useSetMonthlyIncome() {
  const invalidate = useInvalidateBudget();
  return useMutation({ mutationFn: (income: number | null) => setMonthlyIncome(income), onSuccess: invalidate });
}
