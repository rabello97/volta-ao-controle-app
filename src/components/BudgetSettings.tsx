import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { parsePrice } from "@/lib/shopping";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { useBudgets, useDeleteBudget, useSetMonthlyIncome, useUpsertBudget } from "@/hooks/useBudget";
import { useAuth } from "@/context/AuthContext";

/** Edição da renda e dos tetos por categoria. Fica em Configurações porque é
 *  ajuste raro; o acompanhamento do mês vive em Relatórios. */
export function BudgetSettings() {
  const { user } = useAuth();
  const budgets = useBudgets();
  const upsert = useUpsertBudget();
  const remove = useDeleteBudget();
  const saveIncome = useSetMonthlyIncome();

  const [income, setIncome] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0] ?? "");
  const [limit, setLimit] = useState("");

  useEffect(() => {
    if (user?.monthlyIncome !== undefined && user?.monthlyIncome !== null) {
      setIncome(String(user.monthlyIncome));
    }
  }, [user?.monthlyIncome]);

  async function handleSaveIncome() {
    try {
      await saveIncome.mutateAsync(parsePrice(income));
      toast.success("Renda mensal salva.");
    } catch {
      toast.error("Não foi possível salvar a renda.");
    }
  }

  async function handleAddBudget() {
    const value = parsePrice(limit);
    if (!category.trim() || value === null || value <= 0) {
      toast.error("Informe uma categoria e um teto maior que zero.");
      return;
    }
    try {
      await upsert.mutateAsync({ category: category.trim(), monthlyLimit: value });
      setLimit("");
    } catch {
      toast.error("Não foi possível salvar o teto.");
    }
  }

  return (
    <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
      <div className="mb-1 flex flex-wrap items-baseline gap-2.5">
        <h2 className="text-[15px] font-semibold text-text">Orçamento</h2>
        <span className="text-xs text-text-4">Quanto entra por mês e quanto você pretende gastar</span>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2.5">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-[12px] text-text-4">Renda mensal</span>
          <input
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 font-mono text-[13px] text-text outline-none placeholder:text-text-4"
          />
        </label>
        <button
          type="button"
          onClick={handleSaveIncome}
          disabled={saveIncome.isPending}
          className="rounded-[10px] bg-brand px-4 py-2 text-[13px] font-semibold text-brand-ink transition-opacity disabled:opacity-50"
        >
          Salvar
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-2.5">
        <label className="flex min-w-[140px] flex-1 flex-col gap-1.5">
          <span className="text-[12px] text-text-4">Categoria</span>
          <input
            list="categorias-orcamento"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-[13px] text-text outline-none"
          />
          <datalist id="categorias-orcamento">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="flex w-28 flex-col gap-1.5">
          <span className="text-[12px] text-text-4">Teto por mês</span>
          <input
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-right font-mono text-[13px] text-text outline-none placeholder:text-text-4"
          />
        </label>
        <button
          type="button"
          onClick={handleAddBudget}
          disabled={upsert.isPending}
          className="rounded-[10px] border border-divider bg-surface px-4 py-2 text-[13px] font-semibold text-text transition-colors hover:border-divider-strong disabled:opacity-50"
        >
          Definir
        </button>
      </div>

      <div className="mt-4 flex flex-col">
        {(budgets.data ?? []).map((budget) => (
          <div key={budget.id} className="flex items-center gap-3 border-b border-divider py-2.5 last:border-b-0">
            <span className="flex-1 truncate text-[13px] capitalize text-text">{budget.category}</span>
            <span className="flex-none font-mono text-[13px] text-text-3">
              {formatCurrency(Number(budget.monthlyLimit))}
            </span>
            <button
              type="button"
              onClick={() => remove.mutate(budget.id)}
              aria-label={`Remover teto de ${budget.category}`}
              className="flex size-11 flex-none items-center justify-center rounded-[10px] transition-colors md:size-9 text-text-5 hover:bg-negative-tint hover:text-negative"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}

        {budgets.data?.length === 0 && (
          <p className="py-6 text-center text-[12px] text-text-4">
            Nenhum teto ainda. Comece pelas categorias que mais pesam: mercado, transporte, lazer.
          </p>
        )}
      </div>
    </div>
  );
}
