import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/Skeleton";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useWallets } from "@/hooks/useWallets";

/** Saldo dos benefícios (VR e afins). Fica separado do saldo da conta de
 *  propósito: é dinheiro que só serve para um tipo de gasto.
 *
 *  No mockup os cartões apareciam empilhados com sobreposição; aqui eles ficam
 *  lado a lado porque a sobreposição escondia o saldo do segundo — e o saldo é
 *  justamente o que se vem ler. O que fica do mockup é o cartão colorido no
 *  meio dos brancos. */
export function WalletCards({ scope, className }: { scope?: string; className?: string }) {
  const wallets = useWallets(scope);

  if (wallets.isLoading) {
    return <Skeleton className={cn("h-[200px] rounded-[20px]", className)} />;
  }
  const items = (wallets.data ?? []).filter((wallet) => wallet.active);
  if (items.length === 0) return null;

  const total = items.reduce((soma, w) => soma + w.balance, 0);

  return (
    <SurfaceCard title="Vale-refeição" className={className} bodyClassName="gap-2.5">
      {items.map((wallet) => {
        const acabando = wallet.balance <= wallet.monthlyCredit * 0.2;
        const pct = Math.max(0, Math.min(100, Math.round((wallet.balance / wallet.monthlyCredit) * 100)));

        return (
          <div
            key={wallet.id}
            className="relative flex flex-col gap-1.5 overflow-hidden rounded-[16px] bg-[image:var(--spot)] px-[17px] py-[15px] text-spot-fg shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-spot-fg-2">Saldo</span>
              <span className="ml-auto truncate rounded-full bg-[color:var(--spot-line)] px-2.5 py-[3px] text-[12px] font-semibold text-spot-fg">
                {wallet.name}
              </span>
            </div>

            <span
              className={cn(
                "font-mono text-[25px] font-semibold -tracking-[0.02em] tabular-nums",
                wallet.balance < 0 ? "text-negative" : acabando ? "text-warning" : "text-spot-fg",
              )}
            >
              {formatCurrency(wallet.balance)}
            </span>

            <div className="h-1 overflow-hidden rounded-full bg-black/30">
              <div
                className={cn("h-full rounded-full", acabando ? "bg-warning" : "bg-spot-accent")}
                style={{ width: `${pct}%` }}
              />
            </div>

            <span className="text-[11.5px] text-spot-fg-2">
              {wallet.daysUntilNextCredit === 0
                ? "recarrega hoje"
                : `recarrega em ${wallet.daysUntilNextCredit}d`}{" "}
              · {formatCurrency(wallet.monthlyCredit)} por mês
            </span>
          </div>
        );
      })}

      {items.length > 1 && (
        <div className="mt-auto flex items-baseline gap-2 border-t border-divider pt-3 text-[12.5px] text-text-4">
          Juntos
          <span className="ml-auto font-mono text-[15px] font-semibold text-text">{formatCurrency(total)}</span>
        </div>
      )}
    </SurfaceCard>
  );
}
