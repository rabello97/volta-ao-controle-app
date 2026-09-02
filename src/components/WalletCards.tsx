import { Wallet as WalletIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/Skeleton";
import { useWallets } from "@/hooks/useWallets";

/** Saldo dos benefícios (VR e afins). Fica separado do saldo da conta de
 *  propósito: é dinheiro que só serve para um tipo de gasto. */
export function WalletCards({ scope }: { scope?: string }) {
  const wallets = useWallets(scope);

  if (wallets.isLoading) {
    return <Skeleton className="h-[86px] rounded-2xl" />;
  }
  const items = (wallets.data ?? []).filter((wallet) => wallet.active);
  if (items.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((wallet) => {
        const acabando = wallet.balance <= wallet.monthlyCredit * 0.2;
        return (
          <div
            key={wallet.id}
            className="flex flex-col gap-2 rounded-2xl border border-divider bg-surface px-[18px] py-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center gap-2">
              <WalletIcon className="size-3.5 flex-none text-text-4" />
              <span className="flex-1 truncate text-[11px] font-semibold tracking-[0.13em] text-text-4">
                {wallet.name.toUpperCase()}
              </span>
              <span className="flex-none text-[11px] text-text-5">
                {wallet.daysUntilNextCredit === 0
                  ? "recarrega hoje"
                  : `recarrega em ${wallet.daysUntilNextCredit}d`}
              </span>
            </div>

            <span
              className={cn(
                "font-mono text-[23px] font-medium -tracking-[0.02em]",
                wallet.balance < 0 ? "text-negative" : acabando ? "text-warning" : "text-text",
              )}
            >
              {formatCurrency(wallet.balance)}
            </span>

            <div className="h-1 overflow-hidden rounded-[4px] bg-track">
              <div
                className={cn("h-full rounded-[4px]", acabando ? "bg-warning" : "bg-brand")}
                style={{
                  width: `${Math.max(0, Math.min(100, Math.round((wallet.balance / wallet.monthlyCredit) * 100)))}%`,
                }}
              />
            </div>

            <span className="text-[12px] text-text-4">
              {formatCurrency(wallet.monthlyCredit)} por mês · dia {wallet.creditDay}
            </span>
          </div>
        );
      })}
    </div>
  );
}
