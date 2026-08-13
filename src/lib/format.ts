const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCurrency(value: number | string): string {
  return currencyFormatter.format(Number(value));
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  // Datas de calendário (transações, vencimentos) são armazenadas como meia-noite UTC.
  // Formatar em UTC evita que o fuso horário do navegador exiba o dia anterior/seguinte.
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

const MONTH_LABELS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export function formatMonthLabel(month: number): string {
  return MONTH_LABELS[month - 1] ?? String(month);
}
