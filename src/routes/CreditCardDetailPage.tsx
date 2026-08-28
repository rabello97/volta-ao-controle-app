import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { MoneyValue } from "@/components/MoneyValue";
import { useCreditCards, useInvoice } from "@/hooks/useCreditCards";
import { currentInvoiceReference, currentYearMonth } from "@/lib/upcomingDue";
import { formatDate, formatMonthLabel } from "@/lib/format";
import { ErrorPage } from "@/routes/ErrorPage";

export function CreditCardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: cards, isSuccess } = useCreditCards();
  const card = cards?.find((c) => c.id === id);
  // Só decidimos que o cartão não existe depois que a lista carregou — antes
  // disso o `find` retorna undefined só porque os dados ainda não chegaram.
  const notFound = isSuccess && !card;

  const [{ year, month }, setPeriod] = useState(currentYearMonth());
  const invoice = useInvoice(id ?? "", year, month);

  // Assim que sabemos o dia de fechamento do cartão, ajusta o período inicial
  // para a fatura que está de fato aberta (mesma regra do backend), em vez de
  // assumir sempre o mês corrente do calendário.
  const didInitPeriod = useRef(false);
  useEffect(() => {
    if (card && !didInitPeriod.current) {
      didInitPeriod.current = true;
      setPeriod(currentInvoiceReference(card.closingDay));
    }
  }, [card]);

  function goToPreviousMonth() {
    setPeriod((prev) => (prev.month === 1 ? { year: prev.year - 1, month: 12 } : { year: prev.year, month: prev.month - 1 }));
  }

  function goToNextMonth() {
    setPeriod((prev) => (prev.month === 12 ? { year: prev.year + 1, month: 1 } : { year: prev.year, month: prev.month + 1 }));
  }

  if (notFound) {
    return <ErrorPage kind="not-found" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/credit-cards" className="flex w-fit items-center gap-1 text-sm font-medium text-text-3 hover:text-text">
        <ChevronLeft className="size-4" /> Cartões
      </Link>

      <div className="rounded-2xl border border-divider bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-text">{card?.nickname ?? "Cartão"}</h3>
            <div className="text-xs text-text-3">
              {formatMonthLabel(month)}/{year}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="secondary" aria-label="Mês anterior" onClick={goToPreviousMonth}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button size="icon" variant="secondary" aria-label="Próximo mês" onClick={goToNextMonth}>
              <ChevronRight className="size-4" />
            </Button>
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase text-text-3">Total da fatura</div>
              {invoice.data ? (
                <MoneyValue value={invoice.data.total} tone="negative" className="text-xl font-semibold" />
              ) : (
                <span className="text-xl text-text-4">—</span>
              )}
            </div>
          </div>
        </div>

        {invoice.data && invoice.data.transactions.length === 0 && (
          <EmptyState icon={Receipt} title="Sem transações nessa fatura" description="Nada lançado neste mês ainda." />
        )}

        {invoice.data && invoice.data.transactions.length > 0 && (
          <ul className="flex flex-col gap-2">
            {invoice.data.transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-track px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-text">{t.description || t.category}</div>
                  <div className="text-xs text-text-3">
                    {formatDate(t.date)} · {t.category}
                    {t.installmentTotal && t.installmentTotal > 1 ? ` · ${t.installmentNumber} de ${t.installmentTotal}` : ""}
                  </div>
                </div>
                <MoneyValue value={t.amount} tone="negative" className="text-sm font-semibold" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
