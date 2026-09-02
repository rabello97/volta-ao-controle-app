import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { formatCurrency } from "@/lib/format";
import { plural } from "@/lib/plural";
import { parsePrice } from "@/lib/shopping";
import { cn } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { useCreditCards } from "@/hooks/useCreditCards";
import {
  useCreateInstallmentPlan,
  useDeleteInstallmentPlan,
  useInstallmentPlans,
  useUpdateInstallmentPlan,
} from "@/hooks/useInstallments";
import type { InstallmentPlan } from "@/api/types";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function terminaEm(iso: string): string {
  const d = new Date(iso);
  return `${MESES[d.getUTCMonth()]}/${d.getUTCFullYear()}`;
}

/** Compras parceladas como uma coisa só. É o terceiro tipo de gasto do app:
 *  repete como conta fixa, mas tem fim — e por isso não cabia nem em
 *  Transações (onde virava N linhas soltas) nem em Recorrentes. */
export function InstallmentPlans({ scope }: { scope?: string }) {
  const plans = useInstallmentPlans(scope);
  const { data: cards } = useCreditCards(scope);
  const create = useCreateInstallmentPlan();
  const update = useUpdateInstallmentPlan();
  const remove = useDeleteInstallmentPlan();

  const [aberto, setAberto] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState(EXPENSE_CATEGORIES[0] ?? "compras");
  const [valor, setValor] = useState("");
  const [total, setTotal] = useState("");
  const [atual, setAtual] = useState("1");
  const [cartao, setCartao] = useState("");
  const [excluindo, setExcluindo] = useState<InstallmentPlan | null>(null);
  // Renomear vale para a compra inteira. Valor e nº de parcelas não são
  // editáveis: mudar isso é outra compra, e o caminho é excluir e recadastrar.
  const [renomeando, setRenomeando] = useState<InstallmentPlan | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");

  const emAndamento = (plans.data ?? []).filter((p) => !p.finished);
  const encerradas = (plans.data ?? []).filter((p) => p.finished);
  const comprometido = emAndamento.reduce((soma, p) => soma + p.remainingTotal, 0);
  const porMes = emAndamento.reduce((soma, p) => soma + p.installmentAmount, 0);

  async function handleCreate() {
    const parcela = parsePrice(valor);
    const nTotal = Number(total);
    const nAtual = Number(atual);
    const cartaoId = cartao || cards?.[0]?.id;

    if (!descricao.trim() || parcela === null || parcela <= 0 || !cartaoId) {
      toast.error("Informe a descrição, o valor da parcela e o cartão.");
      return;
    }
    if (!Number.isInteger(nTotal) || nTotal < 2) {
      toast.error("Informe em quantas vezes foi parcelado (mínimo 2).");
      return;
    }
    if (!Number.isInteger(nAtual) || nAtual < 1 || nAtual > nTotal) {
      toast.error("A parcela atual precisa estar entre 1 e o total.");
      return;
    }

    try {
      await create.mutateAsync({
        description: descricao.trim(),
        category: categoria,
        installmentAmount: parcela,
        installmentTotal: nTotal,
        currentInstallment: nAtual,
        creditCardId: cartaoId,
      });
      setDescricao("");
      setValor("");
      setTotal("");
      setAtual("1");
      setAberto(false);
      toast.success("Parcelamento cadastrado.");
    } catch {
      toast.error("Não foi possível cadastrar o parcelamento.");
    }
  }

  async function handleRename() {
    if (!renomeando || !novoNome.trim()) return;
    try {
      await update.mutateAsync({
        groupId: renomeando.groupId,
        input: { description: novoNome.trim(), category: novaCategoria },
      });
      setRenomeando(null);
      toast.success("Parcelamento atualizado.");
    } catch {
      toast.error("Não foi possível renomear.");
    }
  }

  async function handleDelete() {
    if (!excluindo) return;
    try {
      await remove.mutateAsync(excluindo.groupId);
      setExcluindo(null);
    } catch {
      toast.error("Não foi possível excluir.");
    }
  }

  if (plans.isError) return <ErrorState onRetry={() => plans.refetch()} />;

  const semCartao = (cards ?? []).length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-[5px] rounded-[14px] border border-divider bg-surface px-[18px] py-4 shadow-[var(--shadow-card)]">
          <span className="text-[11px] font-semibold tracking-[0.13em] text-text-4">AINDA A PAGAR</span>
          <span className="font-mono text-[23px] font-medium -tracking-[0.02em] text-text">
            {formatCurrency(comprometido)}
          </span>
          <span className="text-[12px] text-text-4">{plural(emAndamento.length, "compra")} em andamento</span>
        </div>
        <div className="flex flex-col gap-[5px] rounded-[14px] border border-divider bg-surface px-[18px] py-4 shadow-[var(--shadow-card)]">
          <span className="text-[11px] font-semibold tracking-[0.13em] text-text-4">PESO POR MÊS</span>
          <span className="font-mono text-[23px] font-medium -tracking-[0.02em] text-brand">
            {formatCurrency(porMes)}
          </span>
          <span className="text-[12px] text-text-4">enquanto durarem</span>
        </div>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          disabled={semCartao}
          className={cn(
            "col-span-2 flex flex-col items-start justify-center gap-1 rounded-[14px] border border-dashed px-[18px] py-4 text-left transition-colors sm:col-span-1",
            semCartao
              ? "border-divider text-text-5"
              : "border-divider-strong text-text-3 hover:border-brand hover:text-text",
          )}
        >
          <Plus className="size-4" />
          <span className="text-[13px] font-medium">
            {semCartao ? "Cadastre um cartão primeiro" : "Cadastrar parcelamento"}
          </span>
          {!semCartao && <span className="text-[11px] text-text-5">inclusive um que já está em andamento</span>}
        </button>
      </div>

      {aberto && !semCartao && (
        <section className="flex flex-wrap items-end gap-2.5 rounded-[18px] border border-divider bg-surface px-4 py-4 shadow-[var(--shadow-card)] sm:px-[22px]">
          <label className="flex min-w-[150px] flex-1 flex-col gap-1.5">
            <span className="text-[12px] text-text-4">O que foi</span>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="TV, geladeira, notebook..."
              className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-[13px] text-text outline-none placeholder:text-text-4"
            />
          </label>
          <label className="flex w-28 flex-col gap-1.5">
            <span className="text-[12px] text-text-4">Valor da parcela</span>
            <input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-right font-mono text-[13px] text-text outline-none placeholder:text-text-4"
            />
          </label>
          <label className="flex w-20 flex-col gap-1.5">
            <span className="text-[12px] text-text-4">Em quantas</span>
            <input
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              inputMode="numeric"
              placeholder="10"
              className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-center font-mono text-[13px] text-text outline-none placeholder:text-text-4"
            />
          </label>
          <label className="flex w-20 flex-col gap-1.5">
            <span className="text-[12px] text-text-4">Está na</span>
            <input
              value={atual}
              onChange={(e) => setAtual(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-center font-mono text-[13px] text-text outline-none"
            />
          </label>
          <label className="flex w-32 flex-col gap-1.5">
            <span className="text-[12px] text-text-4">Categoria</span>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-[13px] capitalize text-text outline-none"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex w-32 flex-col gap-1.5">
            <span className="text-[12px] text-text-4">Cartão</span>
            <select
              value={cartao || cards?.[0]?.id || ""}
              onChange={(e) => setCartao(e.target.value)}
              className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-[13px] text-text outline-none"
            >
              {cards?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nickname}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleCreate}
            disabled={create.isPending}
            className="rounded-[10px] bg-brand px-4 py-2 text-[13px] font-semibold text-brand-ink transition-opacity disabled:opacity-50"
          >
            Cadastrar
          </button>
        </section>
      )}

      <section className="rounded-[18px] border border-divider bg-surface px-4 pb-2 pt-5 shadow-[var(--shadow-card)] sm:px-[22px]">
        <div className="mb-1 flex flex-wrap items-baseline gap-2.5">
          <h2 className="text-[15px] font-semibold text-text">Compras parceladas</h2>
          <span className="text-[12px] text-text-4">Repetem todo mês, mas têm data para acabar</span>
        </div>

        {plans.isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="my-3 h-14 w-full" />)}

        {emAndamento.map((plano) => {
          const progresso = Math.round((plano.paidCount / plano.installmentTotal) * 100);
          return (
            <div key={plano.groupId} className="flex flex-col gap-2 border-b border-divider py-3.5 last:border-b-0">
              {renomeando?.groupId === plano.groupId ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    autoFocus
                    className="min-w-[140px] flex-1 rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-[13px] text-text outline-none"
                  />
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="w-32 rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-[13px] capitalize text-text outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleRename}
                    aria-label="Salvar nome"
                    className="flex size-11 items-center justify-center rounded-[10px] bg-brand text-brand-ink md:size-9"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenomeando(null)}
                    aria-label="Cancelar"
                    className="flex size-11 items-center justify-center rounded-[10px] border border-divider text-text-4 md:size-9"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-text">
                  {plano.description}
                </span>
                <span className="font-mono text-[13px] text-text">
                  {formatCurrency(plano.installmentAmount)}
                  <span className="text-text-4">/mês</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRenomeando(plano);
                    setNovoNome(plano.description);
                    setNovaCategoria(plano.category);
                  }}
                  aria-label={`Renomear ${plano.description}`}
                  className="flex size-11 flex-none items-center justify-center rounded-[10px] text-text-5 transition-colors hover:bg-surface-2 hover:text-text md:size-9"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setExcluindo(plano)}
                  aria-label={`Excluir ${plano.description}`}
                  className="flex size-11 flex-none items-center justify-center rounded-[10px] text-text-5 transition-colors hover:bg-negative-tint hover:text-negative md:size-9"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              )}

              <div className="h-1.5 overflow-hidden rounded-[4px] bg-track">
                <div className="h-full rounded-[4px] bg-brand" style={{ width: `${progresso}%` }} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12px] text-text-4">
                <span>
                  {plano.paidCount} de {plano.installmentTotal} pagas · faltam{" "}
                  <strong className="font-semibold text-text-3">{formatCurrency(plano.remainingTotal)}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  {plano.creditCardName && (
                    <>
                      <CreditCard className="size-3" />
                      {plano.creditCardName} ·
                    </>
                  )}
                  termina em {terminaEm(plano.lastDate)}
                </span>
              </div>
            </div>
          );
        })}

        {!plans.isLoading && emAndamento.length === 0 && (
          <p className="py-10 text-center text-[12px] text-text-4">
            Nenhuma compra parcelada em andamento. Cadastre uma acima — inclusive as que já estão rolando, informando
            em qual parcela você está.
          </p>
        )}
      </section>

      {encerradas.length > 0 && (
        <section className="rounded-[18px] border border-divider bg-surface px-4 pb-2 pt-5 shadow-[var(--shadow-card)] sm:px-[22px]">
          <h2 className="mb-1 text-[15px] font-semibold text-text">Já quitadas</h2>
          {encerradas.map((plano) => (
            <div key={plano.groupId} className="flex items-center gap-3 border-b border-divider py-2.5 last:border-b-0">
              <span className="min-w-0 flex-1 truncate text-[13px] text-text-4">{plano.description}</span>
              <span className="flex-none text-[12px] text-text-5">
                {plano.installmentTotal}x · quitada em {terminaEm(plano.lastDate)}
              </span>
              <span className="flex-none font-mono text-[12px] text-text-4">{formatCurrency(plano.total)}</span>
            </div>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(excluindo)}
        onOpenChange={(open) => !open && setExcluindo(null)}
        title="Excluir parcelamento"
        description={`Todas as ${excluindo?.installmentTotal ?? 0} parcelas de "${excluindo?.description ?? ""}" saem do histórico e das faturas, inclusive as já pagas.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
