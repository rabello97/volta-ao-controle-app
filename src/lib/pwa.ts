/** Nome do cache que versões antigas do app usavam para guardar respostas da
 *  API no service worker. Ele foi removido do vite.config.ts, mas continua
 *  gravado nos aparelhos que já instalaram o PWA — e enquanto existir pode
 *  voltar a servir números desatualizados. */
const LEGACY_API_CACHE = "api";

/** Apaga caches de versões anteriores que não são mais usados. Roda uma vez
 *  por carregamento e falha em silêncio: é limpeza, não pode quebrar o app. */
export async function purgeLegacyCaches(): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const names = await caches.keys();
    await Promise.all(
      names.filter((name) => name === LEGACY_API_CACHE).map((name) => caches.delete(name)),
    );
  } catch {
    // Sem permissão de storage ou navegador antigo: seguir sem limpar.
  }
}
