import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adjustWalletBalance,
  createWallet,
  deleteWallet,
  listWallets,
  updateWallet,
  type WalletInput,
} from "@/api/wallets";

/** Mexer numa carteira muda o saldo do benefício e o orçamento do mês. */
function useInvalidateWallets() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["wallets"] });
    queryClient.invalidateQueries({ queryKey: ["budget-status"] });
  };
}

export function useWallets(scope?: string) {
  return useQuery({ queryKey: ["wallets", scope ?? "self"], queryFn: () => listWallets(scope) });
}

export function useCreateWallet() {
  const invalidate = useInvalidateWallets();
  return useMutation({ mutationFn: (input: WalletInput) => createWallet(input), onSuccess: invalidate });
}

export function useUpdateWallet() {
  const invalidate = useInvalidateWallets();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<WalletInput> }) => updateWallet(id, input),
    onSuccess: invalidate,
  });
}

export function useAdjustWalletBalance() {
  const invalidate = useInvalidateWallets();
  return useMutation({
    mutationFn: ({ id, balance }: { id: string; balance: number }) => adjustWalletBalance(id, balance),
    onSuccess: invalidate,
  });
}

export function useDeleteWallet() {
  const invalidate = useInvalidateWallets();
  return useMutation({ mutationFn: (id: string) => deleteWallet(id), onSuccess: invalidate });
}
