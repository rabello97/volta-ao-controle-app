import { cn } from "@/lib/utils";

interface SurfaceCardProps {
  title?: string;
  /** Slot à direita do título: link "Ver todas", abas, seletor de período. */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Card claro da direção "Marca sólida": sem borda, cantos de 20px e a sombra
 *  suave em duas camadas. A ausência de borda é proposital — o que separa os
 *  blocos é a elevação, e a borda só volta no card escuro de destaque. */
export function SurfaceCard({ title, action, children, className, bodyClassName }: SurfaceCardProps) {
  return (
    <section className={cn("flex flex-col rounded-[20px] bg-surface p-[19px] shadow-[var(--shadow-soft)]", className)}>
      {(title || action) && (
        <header className="mb-[15px] flex items-center gap-2.5">
          {title && <h2 className="text-[14.5px] font-semibold text-text">{title}</h2>}
          {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn("flex min-w-0 flex-1 flex-col", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Link discreto do cabeçalho de um SurfaceCard ("Ver todas", "Ajustar"). */
export function CardLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[12.5px] text-text-4 transition-colors hover:text-brand"
    >
      {children}
    </button>
  );
}

/** Abas em pílula do cabeçalho (ex.: "6 meses" / "12 meses"). */
export function CardTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-full bg-track p-[3px]">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-9 rounded-full px-[11px] text-[12px] transition-colors sm:min-h-0 sm:py-1",
              active ? "bg-surface font-semibold text-text shadow-[var(--shadow-card)]" : "text-text-4 hover:text-text",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
