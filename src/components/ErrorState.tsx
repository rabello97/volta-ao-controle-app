import { RotateCw, WifiOff } from "lucide-react";

interface ErrorStateProps {
  onRetry?: () => void;
  title?: string;
  description?: string;
}

/** Mostrado quando uma consulta falha. Sem isto a tela ficava em branco —
 *  nem os dados, nem o vazio, nem o erro — e parecia que o app tinha
 *  simplesmente parado de funcionar. */
export function ErrorState({
  onRetry,
  title = "Não foi possível carregar",
  description = "Verifique sua conexão. Se você já abriu esta tela antes, os últimos dados salvos continuam disponíveis offline.",
}: ErrorStateProps) {
  return (
    <section className="flex flex-col items-center gap-2 rounded-[18px] border border-divider bg-surface px-[22px] py-12 text-center">
      <div className="mb-1.5 flex size-[46px] items-center justify-center rounded-[14px] bg-negative-tint text-negative">
        <WifiOff className="size-5" />
      </div>
      <span className="text-[15px] font-semibold text-text">{title}</span>
      <span className="max-w-[380px] text-[13px] leading-[1.5] text-text-3">{description}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 flex items-center gap-[7px] rounded-[10px] bg-brand px-4 py-[9px] text-[13px] font-semibold text-brand-ink transition-all hover:bg-brand-hover active:scale-95"
        >
          <RotateCw className="size-3.5" /> Tentar novamente
        </button>
      )}
    </section>
  );
}
