import { useState } from "react";
import { Check, Plus, Trash2, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { formatCurrency, formatDate } from "@/lib/format";
import { plural } from "@/lib/plural";
import { parsePrice } from "@/lib/shopping";
import { cn } from "@/lib/utils";
import {
  useCompleteHouseTask,
  useCreateHouseTask,
  useDeleteHouseTask,
  useHouseTasks,
} from "@/hooks/useHouseTasks";
import type { HouseTask } from "@/api/types";

const REPETICOES = [
  { value: "0", label: "Uma vez só" },
  { value: "1", label: "Todo mês" },
  { value: "3", label: "A cada 3 meses" },
  { value: "6", label: "A cada 6 meses" },
  { value: "12", label: "Todo ano" },
];

const STATUS_LABEL: Record<HouseTask["status"], { texto: string; classe: string }> = {
  OVERDUE: { texto: "Atrasado", classe: "bg-negative-tint text-negative" },
  SOON: { texto: "Chegando", classe: "bg-warning-tint text-warning" },
  SCHEDULED: { texto: "Agendado", classe: "bg-surface-2 text-text-4" },
  DONE: { texto: "Feito", classe: "bg-brand-tint text-brand" },
};

function prazoTexto(task: HouseTask): string {
  if (task.status === "DONE") return `Concluído em ${formatDate(task.completedAt ?? task.dueDate)}`;
  if (task.daysUntilDue < 0) return `Venceu há ${plural(Math.abs(task.daysUntilDue), "dia")}`;
  if (task.daysUntilDue === 0) return "Vence hoje";
  return `Em ${plural(task.daysUntilDue, "dia")} · ${formatDate(task.dueDate)}`;
}

/** IPVA, seguro, revisão, troca de filtro: o que a casa cobra em datas, não
 *  todo mês. Fica ao lado da lista de compras porque é a mesma cabeça de
 *  "coisas da casa", só que com prazo em vez de carrinho. */
export function HouseAgenda({ scope }: { scope?: string }) {
  const tasks = useHouseTasks(scope);
  const create = useCreateHouseTask();
  const complete = useCompleteHouseTask();
  const remove = useDeleteHouseTask();

  const [name, setName] = useState("");
  // Categoria fixa por enquanto: o que diferencia esses itens é a data, não o
  // tipo. Quando houver filtro por categoria aqui, vira campo.
  const category = "casa";
  const [dueDate, setDueDate] = useState("");
  const [cost, setCost] = useState("");
  const [recurrence, setRecurrence] = useState("12");
  const [deleting, setDeleting] = useState<HouseTask | null>(null);

  const pendentes = (tasks.data ?? []).filter((task) => task.status !== "DONE");
  const concluidos = (tasks.data ?? []).filter((task) => task.status === "DONE");
  const totalPrevisto = pendentes.reduce((sum, task) => sum + (task.estimatedCost ?? 0), 0);

  async function handleCreate() {
    if (!name.trim() || !dueDate) {
      toast.error("Informe o nome e a data.");
      return;
    }
    try {
      await create.mutateAsync({
        name: name.trim(),
        category: category.trim() || "casa",
        dueDate,
        recurrenceMonths: recurrence === "0" ? null : Number(recurrence),
        estimatedCost: parsePrice(cost),
      });
      setName("");
      setCost("");
      setDueDate("");
    } catch {
      toast.error("Não foi possível salvar o compromisso.");
    }
  }

  async function handleComplete(task: HouseTask) {
    try {
      const { next } = await complete.mutateAsync(task.id);
      toast.success(next ? `Feito. Próximo já agendado para ${formatDate(next.dueDate)}.` : "Feito.");
    } catch {
      toast.error("Não foi possível concluir.");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      toast.error("Não foi possível excluir.");
    }
  }

  if (tasks.isError) return <ErrorState onRetry={() => tasks.refetch()} />;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-wrap items-end gap-2.5 rounded-[18px] border border-divider bg-surface px-4 py-4 shadow-[var(--shadow-card)] sm:px-[22px]">
        <label className="flex min-w-[150px] flex-1 flex-col gap-1.5">
          <span className="text-[12px] text-text-4">O que é</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="IPVA, seguro, revisão..."
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-[13px] text-text outline-none placeholder:text-text-4"
          />
        </label>
        <label className="flex w-[132px] flex-col gap-1.5">
          <span className="text-[12px] text-text-4">Quando vence</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-[13px] text-text outline-none"
          />
        </label>
        <label className="flex w-24 flex-col gap-1.5">
          <span className="text-[12px] text-text-4">Previsto</span>
          <input
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            inputMode="decimal"
            placeholder="R$"
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-right font-mono text-[13px] text-text outline-none placeholder:text-text-4"
          />
        </label>
        <label className="flex w-[136px] flex-col gap-1.5">
          <span className="text-[12px] text-text-4">Repete</span>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-[13px] text-text outline-none"
          >
            {REPETICOES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={handleCreate}
          disabled={create.isPending}
          className="flex flex-none items-center gap-1.5 rounded-[10px] bg-brand px-4 py-2 text-[13px] font-semibold text-brand-ink transition-opacity disabled:opacity-50"
        >
          <Plus className="size-4" />
          Agendar
        </button>
      </section>

      <section className="rounded-[18px] border border-divider bg-surface px-4 pb-2 pt-5 shadow-[var(--shadow-card)] sm:px-[22px]">
        <div className="mb-1 flex flex-wrap items-baseline gap-2.5">
          <h2 className="text-[15px] font-semibold text-text">A vencer</h2>
          {totalPrevisto > 0 && (
            <span className="text-xs text-text-4">{formatCurrency(totalPrevisto)} previstos ao todo</span>
          )}
        </div>

        {tasks.isLoading && [0, 1].map((i) => <Skeleton key={i} className="my-3 h-12 w-full" />)}

        {pendentes.map((task) => (
          <div key={task.id} className="flex items-center gap-3 border-b border-divider py-3 last:border-b-0">
            <button
              type="button"
              onClick={() => handleComplete(task)}
              aria-label={`Concluir ${task.name}`}
              className="flex size-8 flex-none items-center justify-center rounded-xl border border-divider-strong text-text-5 transition-colors hover:border-brand hover:text-brand"
            >
              <Check className="size-4" />
            </button>

            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <span className="truncate text-[13px] font-medium text-text">{task.name}</span>
              <span className="truncate text-[12px] text-text-4">{prazoTexto(task)}</span>
            </div>

            {task.estimatedCost !== null && (
              <span className="flex-none font-mono text-[13px] text-text-3">
                {formatCurrency(task.estimatedCost)}
              </span>
            )}

            <span
              className={cn(
                "flex-none whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold",
                STATUS_LABEL[task.status].classe,
              )}
            >
              {STATUS_LABEL[task.status].texto}
            </span>

            <button
              type="button"
              onClick={() => setDeleting(task)}
              aria-label={`Excluir ${task.name}`}
              className="flex size-11 flex-none items-center justify-center rounded-[10px] transition-colors md:size-9 text-text-5 hover:bg-negative-tint hover:text-negative"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}

        {!tasks.isLoading && pendentes.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <CalendarClock className="size-7 text-text-5" />
            <span className="text-[13px] text-text-3">Nada agendado</span>
            <span className="max-w-[280px] text-[12px] text-text-4">
              IPVA, seguro, revisão do carro, troca de filtro — o que a casa cobra em data, não todo mês.
            </span>
          </div>
        )}
      </section>

      {concluidos.length > 0 && (
        <section className="rounded-[18px] border border-divider bg-surface px-4 pb-2 pt-5 shadow-[var(--shadow-card)] sm:px-[22px]">
          <h2 className="mb-1 text-[15px] font-semibold text-text">Já resolvidos</h2>
          {concluidos.map((task) => (
            <div key={task.id} className="flex items-center gap-3 border-b border-divider py-2.5 last:border-b-0">
              <span className="min-w-0 flex-1 truncate text-[13px] text-text-4 line-through">{task.name}</span>
              <span className="flex-none text-[12px] text-text-5">{prazoTexto(task)}</span>
            </div>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir compromisso"
        description="Ele some da agenda da casa. Se repetia, as próximas ocorrências não serão criadas."
        onConfirm={handleDelete}
      />
    </div>
  );
}
