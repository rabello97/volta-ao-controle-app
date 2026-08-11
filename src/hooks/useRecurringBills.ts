import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRecurringBill,
  deleteRecurringBill,
  listRecurringBills,
  updateRecurringBill,
  type RecurringBillInput,
  type UpdateRecurringBillInput,
} from "@/api/recurringBills";

export function useRecurringBills() {
  return useQuery({ queryKey: ["recurring-bills"], queryFn: listRecurringBills });
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
