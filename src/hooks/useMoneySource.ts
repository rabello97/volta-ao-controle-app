import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { confirmMoneySource, listPendingSourceConfirmations } from "@/api/transactions";
import type { InvoiceChoice, MoneySource } from "@/api/types";

/** Fica visível para o parceiro em qualquer tela, então recarrega sozinho de
 *  vez em quando: sem push, é assim que ela fica sabendo. */
export function usePendingSourceConfirmations() {
  return useQuery({
    queryKey: ["origem-pendente"],
    queryFn: listPendingSourceConfirmations,
    refetchInterval: 1000 * 60 * 2,
  });
}

export function useConfirmMoneySource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      source: Exclude<MoneySource, "PARTNER">;
      registrarNaMinhaConta?: boolean;
      creditCardId?: string;
      invoiceChoice?: InvoiceChoice;
    }) => confirmMoneySource(id, input),
    onSuccess: () => {
      // Confirmar muda o painel dos dois: a origem decide se aquilo era sobra
      // ou dívida, e pode ter criado uma saída na conta de quem emprestou.
      for (const key of ["origem-pendente", "transactions", "dashboard", "budget-status", "credit-cards"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}
