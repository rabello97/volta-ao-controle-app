import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

/** De quanto em quanto tempo procurar versão nova enquanto o app está aberto.
 *  Sem isso, quem deixa o PWA aberto o dia todo só receberia a atualização no
 *  próximo cold start. */
const INTERVALO_DE_CHECAGEM = 60 * 60 * 1000;

const CHAVE = "vac_build";

/** Cuida da troca de versão do PWA.
 *
 *  O service worker se atualiza sozinho (autoUpdate) — tentar pedir confirmação
 *  criava um impasse, porque o worker novo ficava esperando e quem mostraria o
 *  botão era ele mesmo. Aqui só detectamos que a versão mudou e avisamos, para
 *  a atualização deixar de ser silenciosa. */
export function UpdateWatcher() {
  useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => {
        if (navigator.onLine) registration.update();
      }, INTERVALO_DE_CHECAGEM);
    },
  });

  useEffect(() => {
    let anterior: string | null = null;
    try {
      anterior = localStorage.getItem(CHAVE);
      localStorage.setItem(CHAVE, __BUILD_ID__);
    } catch {
      // Sem acesso ao storage não dá para comparar; seguir sem avisar.
      return;
    }

    // Na primeira visita não há o que comparar — avisar seria confuso.
    if (anterior && anterior !== __BUILD_ID__) {
      toast.success("App atualizado para a versão mais recente.");
    }
  }, []);

  return null;
}
