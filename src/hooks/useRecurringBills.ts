import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRecurringBill,
  deleteRecurringBill,
  getRecurringBillStats,
  listRecurringBills,
  listRecurringBillsWithStatus,
  payRecurringBill,
  updateRecurringBill,
  type RecurringBillInput,
  type UpdateRecurringBillInput,
} from "@/api/recurringBills";

export function useRecurringBills(scope?: string) {
  return useQuery({ queryKey: ["recurring-bills", scope ?? "self"], queryFn: () => listRecurringBills(scope) });
}

export function useRecurringBillsWithStatus(scope?: string, month?: string) {
  return useQuery({
    queryKey: ["recurring-bills", "with-status", scope ?? "self", month ?? "atual"],
    queryFn: () => listRecurringBillsWithStatus(scope, month),
  });
}

export function useRecurringBillStats(scope?: string, month?: string) {
  return useQuery({
    queryKey: ["recurring-bills", "stats", scope ?? "self", month ?? "atual"],
    queryFn: () => getRecurringBillStats(scope, month),
  });
}

export function usePayRecurringBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payRecurringBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-bills"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-due"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useCreateRecurringBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecurringBillInput) => createRecurringBill(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-bills"] }),
  });
}

export function useUpdateRecurringBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRecurringBillInput }) => updateRecurringBill(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-bills"] }),
  });
}

export function useDeleteRecurringBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecurringBill(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring-bills"] }),
  });
}
