import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FabProps {
  label: string;
  onClick: () => void;
  className?: string;
}

/** Ação principal de criar, no celular. No desktop ela vive no cabeçalho — ter
 *  as duas ao mesmo tempo era duplicar o mesmo comando na mesma tela, e a
 *  versão do cabeçalho ainda ocupava uma faixa inteira acima do conteúdo. */
export function Fab({ label, onClick, className }: FabProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-20 flex size-14 items-center justify-center rounded-full bg-brand text-brand-ink shadow-lg transition-transform active:scale-95 sm:hidden",
        className,
      )}
    >
      <Plus className="size-6" />
    </button>
  );
}
