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

export function useRecurringBills() {
  return useQuery({ queryKey: ["recurring-bills"], queryFn: listRecurringBills });
}

export function useRecurringBillsWithStatus() {
  return useQuery({ queryKey: ["recurring-bills", "with-status"], queryFn: listRecurringBillsWithStatus });
}

export function useRecurringBillStats() {
  return useQuery({ queryKey: ["recurring-bills", "stats"], queryFn: getRecurringBillStats });
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
