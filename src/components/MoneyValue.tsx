import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MoneyValueProps {
  value: number | string;
  tone?: "positive" | "negative" | "neutral" | "auto";
  signed?: boolean;
  className?: string;
}

export function MoneyValue({ value, tone = "neutral", signed = false, className }: MoneyValueProps) {
  const numeric = Number(value);
  const resolvedTone = tone === "auto" ? (numeric < 0 ? "negative" : "positive") : tone;

  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        resolvedTone === "positive" && "text-positive",
        resolvedTone === "negative" && "text-negative",
        resolvedTone === "neutral" && "text-text",
        className,
      )}
    >
      {signed && numeric > 0 ? "+" : ""}
      {formatCurrency(numeric)}
    </span>
  );
}
