import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCreditCard,
  getInvoiceByMonth,
  listCreditCards,
  updateCreditCard,
  type CreditCardInput,
} from "@/api/creditCards";

/** O escopo entra na chave do cache: sem isso os dados do parceiro e os seus
 *  se sobrescreveriam na mesma entrada. */
export function useCreditCards(scope?: string) {
  return useQuery({ queryKey: ["credit-cards", scope ?? "self"], queryFn: () => listCreditCards(scope) });
}

export function useCreateCreditCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreditCardInput) => createCreditCard(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["credit-cards"] }),
  });
}

export function useUpdateCreditCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreditCardInput> }) => updateCreditCard(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["credit-cards"] }),
  });
}

export function useInvoice(cardId: string, year: number, month: number) {
  return useQuery({
    queryKey: ["invoice", cardId, year, month],
    queryFn: () => getInvoiceByMonth(cardId, year, month),
    enabled: Boolean(cardId),
  });
}
