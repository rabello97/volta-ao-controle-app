import { cn } from "@/lib/utils";

interface SpotCardProps {
  /** Rótulo em versalete com o ponto de acento à esquerda. */
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}

/** O único card escuro da tela. Na direção aprovada ele existe para carregar
 *  o conteúdo que merece leitura, não só um número: a análise da IA, o total
 *  da dívida parcelada. Usar mais de um por tela desfaz o destaque. */
export function SpotCard({ eyebrow, children, className }: SpotCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-[20px] bg-[image:var(--spot)] p-[19px] text-spot-fg shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-spot-fg-2">
        <span className="size-1.5 flex-none rounded-full bg-spot-accent" />
        {eyebrow}
      </div>
      {children}
    </section>
  );
}

/** Botão de ação dentro do card escuro — vidro sobre o fundo, não a cor da marca. */
export function SpotAction({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--spot-line)] px-3.5 py-2 text-[13px] font-semibold text-spot-fg transition-colors hover:bg-white/20"
    >
      {children}
    </button>
  );
}
