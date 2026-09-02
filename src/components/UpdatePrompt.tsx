import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw } from "lucide-react";

/** De quanto em quanto tempo o app procura versão nova enquanto está aberto.
 *  Sem isso, quem deixa o PWA aberto o dia todo só descobre a atualização no
 *  próximo cold start. */
const INTERVALO_DE_CHECAGEM = 60 * 60 * 1000;

/** Aviso de versão nova. Antes a troca era automática e silenciosa: o app podia
 *  seguir mostrando a versão anterior por um ou dois acessos, sem nada na tela
 *  explicando. Agora é uma decisão visível de um toque. */
export function UpdatePrompt() {
  const {
    needRefresh: [precisaAtualizar, setPrecisaAtualizar],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => {
        // Só faz sentido perguntar ao servidor se há rede.
        if (navigator.onLine) registration.update();
      }, INTERVALO_DE_CHECAGEM);
    },
  });

  if (!precisaAtualizar) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-[14px] border border-divider bg-surface px-4 py-3 shadow-[var(--shadow-card)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:mx-0"
    >
      <RefreshCw className="size-4 flex-none text-brand" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[13px] font-medium text-text">Nova versão disponível</span>
        <span className="text-[12px] text-text-4">Atualize para ver as mudanças mais recentes.</span>
      </div>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="flex-none rounded-[10px] bg-brand px-3 py-2 text-[13px] font-semibold text-brand-ink transition-opacity hover:opacity-90"
      >
        Atualizar
      </button>
      <button
        type="button"
        onClick={() => setPrecisaAtualizar(false)}
        aria-label="Agora não"
        className="flex size-9 flex-none items-center justify-center rounded-[10px] text-text-5 transition-colors hover:bg-surface-2 hover:text-text"
      >
        ✕
      </button>
    </div>
  );
}
