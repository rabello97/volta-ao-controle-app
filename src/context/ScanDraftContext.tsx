import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCreditCards } from "@/hooks/useCreditCards";
import { useCreateTransaction, useDeleteTransaction } from "@/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/lib/format";
import { draftFromScan } from "@/lib/scan";
import { cn } from "@/lib/utils";
import type { ScanResult } from "@/api/types";

interface ScanFlowValue {
  /** Recebe a leitura da imagem e conduz até a transação criada. */
  start: (result: ScanResult) => void;
}

const ScanFlowContext = createContext<ScanFlowValue | null>(null);

export function ScanDraftProvider({ children }: { children: React.ReactNode }) {
  const [lido, setLido] = useState<ScanResult | null>(null);
  const cards = useCreditCards();
  const criar = useCreateTransaction();
  const excluir = useDeleteTransaction();

  const start = useCallback((result: ScanResult) => setLido(result), []);

  /** Cria a transação com o que a IA leu. `cardId` nulo = sem cartão, que é
   *  o que acontece quando a pessoa fecha a janela sem escolher. */
  const salvar = useCallback(
    async (result: ScanResult, cardId: string | null) => {
      setLido(null);
      const draft = draftFromScan(result, cards.data) as Record<string, unknown>;
      try {
        const criada = await criar.mutateAsync({
          type: result.tipo,
          amount: result.valor,
          date: (draft.date as string) ?? new Date().toISOString().slice(0, 10),
          category: result.categoriaSugerida || "outros",
          description: result.descricao || result.estabelecimento,
          ...(result.parcelas > 1 ? { installmentTotal: result.parcelas } : {}),
          ...(cardId ? { creditCardId: cardId, invoiceChoice: "CURRENT" as const } : {}),
        });
        // A IA erra: em vez de exigir conferência antes de salvar, salva e
        // deixa o desfazer a um toque.
        toast.success(`${result.descricao || result.estabelecimento} · ${formatCurrency(result.valor)} lançado`, {
          action: {
            label: "Desfazer",
            onClick: () => {
              void excluir.mutateAsync(criada.id).then(
                () => toast.success("Lançamento desfeito."),
                () => toast.error("Não consegui desfazer."),
              );
            },
          },
        });
      } catch {
        toast.error("Não consegui salvar o lançamento da imagem.");
      }
    },
    [cards.data, criar, excluir],
  );

  const value = useMemo(() => ({ start }), [start]);

  const ativos = (cards.data ?? []).filter((c) => c.id);
  const sugerido = lido
    ? ativos.find((c) => lido.cartaoSugerido && c.nickname.toLowerCase() === lido.cartaoSugerido.toLowerCase())
    : undefined;

  return (
    <ScanFlowContext.Provider value={value}>
      {children}

      <Dialog
        open={lido !== null}
        // Fechar sem escolher salva sem cartão — foi o combinado: a pergunta
        // do cartão é opcional, o lançamento não.
        onOpenChange={(open) => {
          if (!open && lido) void salvar(lido, null);
        }}
      >
        <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-[440px] sm:rounded-[26px]">
          {lido && (
            <>
              <div className="rounded-t-2xl bg-[image:var(--spot)] px-5 py-5 text-spot-fg sm:rounded-t-[26px]">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 flex-none items-center justify-center rounded-full bg-[color:var(--spot-line)]">
                    <Camera className="size-4" />
                  </span>
                  <DialogTitle className="text-[15px] font-semibold text-spot-fg">Li a imagem</DialogTitle>
                  <button
                    type="button"
                    aria-label="Fechar e salvar sem cartão"
                    onClick={() => void salvar(lido, null)}
                    className="ml-auto flex size-8 items-center justify-center rounded-full text-spot-fg-2 transition-colors hover:bg-white/15 hover:text-spot-fg"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <DialogDescription className="sr-only">
                  Confira o que a IA leu e escolha o cartão, ou feche para salvar sem cartão.
                </DialogDescription>

                <div className="mt-4 font-mono text-[34px] font-semibold -tracking-[0.03em] tabular-nums">
                  {formatCurrency(lido.valor)}
                </div>
                <div className="mt-1 text-[13px] text-spot-fg-2">
                  {lido.descricao || lido.estabelecimento || "Sem descrição"} · {formatDate(lido.data)}
                  {lido.categoriaSugerida ? ` · ${lido.categoriaSugerida}` : ""}
                  {lido.parcelas > 1 ? ` · ${lido.parcelas}×` : ""}
                </div>
                {lido.confianca !== "alta" && (
                  <div className="mt-3 rounded-[10px] bg-warning-tint px-3 py-2 text-[12px] text-warning">
                    {lido.observacao || "A leitura não ficou nítida — confira o valor depois de salvar."}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 px-5 py-5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-5">
                  Vincular a algum cartão?
                </span>

                {ativos.length === 0 ? (
                  <p className="text-[13px] text-text-4">Você ainda não cadastrou cartões — vai entrar sem cartão.</p>
                ) : (
                  ativos.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => void salvar(lido, card.id)}
                      disabled={criar.isPending}
                      className={cn(
                        "flex items-center gap-3 rounded-[13px] border px-3.5 py-3 text-left transition-colors disabled:opacity-60",
                        card.id === sugerido?.id
                          ? "border-brand bg-brand-tint"
                          : "border-divider bg-surface-inset hover:border-divider-strong",
                      )}
                    >
                      <span className="text-[14px] font-medium text-text">{card.nickname}</span>
                      {card.id === sugerido?.id && (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-ink">
                          sugerido pela IA
                        </span>
                      )}
                      <span className="ml-auto font-mono text-[12.5px] text-text-4">
                        vence dia {card.dueDay}
                      </span>
                    </button>
                  ))
                )}

                <button
                  type="button"
                  onClick={() => void salvar(lido, null)}
                  disabled={criar.isPending}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-[14px] font-semibold text-brand-ink transition-colors hover:bg-brand-hover disabled:opacity-60"
                >
                  {criar.isPending && <Loader2 className="size-4 animate-spin" />}
                  Salvar sem cartão
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ScanFlowContext.Provider>
  );
}

export function useScanDraft(): ScanFlowValue {
  const ctx = useContext(ScanFlowContext);
  if (!ctx) throw new Error("useScanDraft precisa estar dentro de ScanDraftProvider");
  return ctx;
}
