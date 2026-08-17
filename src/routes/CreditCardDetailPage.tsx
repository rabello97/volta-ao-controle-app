import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useCreditCards, useInvoice } from "@/hooks/useCreditCards";
import { currentInvoiceReference, currentYearMonth } from "@/lib/upcomingDue";
import { formatCurrency, formatDate, formatMonthLabel } from "@/lib/format";

export function CreditCardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: cards } = useCreditCards();
  const card = cards?.find((c) => c.id === id);

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

  return (
    <div className="flex flex-col gap-4">
      <Link to="/credit-cards" className="flex w-fit items-center gap-1 text-sm font-medium text-text-muted hover:text-text">
        <ChevronLeft className="size-4" /> Cartões
      </Link>

      <div className="rounded-xl border border-divider bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-text">{card?.nickname ?? "Cartão"}</h3>
            <div className="text-xs text-text-muted">
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
              <div className="text-[11px] font-semibold uppercase text-text-muted">Total da fatura</div>
              <div className="font-heading text-xl font-extrabold text-negative">
                {invoice.data ? formatCurrency(invoice.data.total) : "—"}
              </div>
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
                  <div className="text-xs text-text-muted">
                    {formatDate(t.date)} · {t.category}
                  </div>
                </div>
                <span className="text-sm font-bold text-negative">{formatCurrency(t.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
