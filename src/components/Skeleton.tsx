import { cn } from "@/lib/utils";

/** Bloco cinza pulsante usado enquanto os dados carregam. Evita o "pisca":
 *  sem ele a tela mostra zeros e depois salta para o valor real, que é o que
 *  mais denuncia que aquilo é um site e não um app. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-track", className)} aria-hidden="true" />;
}

/** Placeholder de valor monetário, na mesma altura da fonte monoespaçada. */
export function SkeletonMoney({ className }: { className?: string }) {
  return <Skeleton className={cn("h-5 w-28", className)} />;
}
