import { useState } from "react";
import { HandCoins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SpotCard } from "@/components/SpotCard";
import { useCreditCards } from "@/hooks/useCreditCards";
import { usePendingSourceConfirmations, useConfirmMoneySource } from "@/hooks/useMoneySource";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ORIGENS_DO_DINHEIRO, type MoneySource } from "@/api/types";

type Origem = Exclude<MoneySource, "PARTNER">;

/** Aparece para quem emprestou. Só ela sabe de onde o dinheiro saiu, e a
 *  resposta decide se a casa apenas moveu dinheiro ou contraiu dívida nova —
 *  por isso o card fica no painel, e não escondido numa tela de ajustes. */
export function OrigemPendenteCard({ className }: { className?: string }) {
  const pendentes = usePendingSourceConfirmations();
  const confirmar = useConfirmMoneySource();
  const { data: cards } = useCreditCards();
  const [origem, setOrigem] = useState<Origem | null>(null);
  const [registrar, setRegistrar] = useState(true);
  const [cartao, setCartao] = useState("");

  const item = pendentes.data?.[0];
  if (!item) return null;

  const precisaDeCartao = origem === "CARD_LOAN";

  async function enviar() {
    if (!origem || !item) return;
    try {
      await confirmar.mutateAsync({
        id: item.id,
        source: origem,
        registrarNaMinhaConta: registrar,
        ...(precisaDeCartao && cartao ? { creditCardId: cartao, invoiceChoice: "CURRENT" as const } : {}),
      });
      toast.success("Origem confirmada.");
      setOrigem(null);
      setCartao("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não consegui confirmar agora.");
    }
  }

  return (
    <SpotCard eyebrow="Esperando você" className={className}>
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 flex-none items-center justify-center rounded-full bg-[color:var(--spot-line)]">
          <HandCoins className="size-4" />
        </span>
        <p className="text-[14.5px] leading-[1.5] text-spot-fg">
          Registraram <b className="font-mono">{formatCurrency(Number(item.amount))}</b> como dinheiro que veio de
          você, em {formatDate(item.date)}. De onde saiu?
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {ORIGENS_DO_DINHEIRO.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setOrigem(o.value)}
            className={cn(
              "rounded-[13px] px-3.5 py-2.5 text-left transition-colors",
              origem === o.value
                ? "bg-spot-accent text-side-accent-ink"
                : "bg-[color:var(--spot-line)] text-spot-fg hover:bg-white/20",
            )}
          >
            <span className="block text-[13.5px] font-semibold">{o.label}</span>
            <span className={cn("block text-[12px]", origem === o.value ? "opacity-80" : "text-spot-fg-2")}>
              {o.dica}
            </span>
          </button>
        ))}
      </div>

      {origem && (
        <>
          {precisaDeCartao && (cards ?? []).length > 0 && (
            <select
              value={cartao}
              onChange={(e) => setCartao(e.target.value)}
              className="rounded-[11px] bg-[color:var(--spot-line)] px-3 py-2 text-[13.5px] text-spot-fg outline-none"
            >
              <option value="">De qual cartão?</option>
              {cards?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nickname}
                </option>
              ))}
            </select>
          )}

          <label className="flex items-start gap-2.5 text-[13px] leading-[1.45] text-spot-fg-2">
            <input
              type="checkbox"
              checked={registrar}
              onChange={(e) => setRegistrar(e.target.checked)}
              className="mt-0.5 size-4 flex-none accent-[var(--spot-accent)]"
            />
            Descontar da minha conta também — cria a saída aqui, marcada como transferência para não contar duas
            vezes na casa.
          </label>

          <button
            type="button"
            onClick={() => void enviar()}
            disabled={confirmar.isPending}
            className="mt-1 flex items-center justify-center gap-2 rounded-full bg-spot-accent px-4 py-2.5 text-[14px] font-semibold text-side-accent-ink transition-opacity disabled:opacity-60"
          >
            {confirmar.isPending && <Loader2 className="size-4 animate-spin" />}
            Confirmar origem
          </button>
        </>
      )}

      {(pendentes.data?.length ?? 0) > 1 && (
        <span className="text-[12px] text-spot-fg-2">
          Mais {(pendentes.data?.length ?? 1) - 1} esperando depois desta.
        </span>
      )}
    </SpotCard>
  );
}
