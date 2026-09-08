import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCreditCards } from "@/hooks/useCreditCards";
import { useWallets } from "@/hooks/useWallets";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { askAssistant } from "@/api/ai";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AcaoProposta, AssistantResult } from "@/api/types";

const EXEMPLOS = [
  "gastei 45 no posto pelo Nubank",
  "almocei fora 38",
  "comprei um fone de 600 em 6x no Itaú",
  "recebi 500 de reembolso ontem",
];

/** A API de voz não está nos tipos padrão do TS, e só precisamos deste pedaço. */
interface Reconhecimento {
  lang: string;
  interimResults: boolean;
  start: () => void;
  abort: () => void;
  onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

/** Reconhecimento de voz do navegador. Existe no Chrome e no Safari; onde não
 *  existir, o botão de microfone simplesmente não aparece. */
function getSpeechRecognition(): (new () => Reconhecimento) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => Reconhecimento;
    webkitSpeechRecognition?: new () => Reconhecimento;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function AssistantSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [resultado, setResultado] = useState<AssistantResult | null>(null);
  const [ouvindo, setOuvindo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const reconhecimento = useRef<Reconhecimento | null>(null);

  const { data: cards } = useCreditCards();
  const { data: wallets } = useWallets();
  const criar = useCreateTransaction();

  useEffect(() => {
    if (!open) {
      setTexto("");
      setResultado(null);
      setPensando(false);
      reconhecimento.current?.abort();
      setOuvindo(false);
    }
  }, [open]);

  async function perguntar(frase: string) {
    if (!frase.trim() || pensando) return;
    setPensando(true);
    setResultado(null);
    try {
      setResultado(await askAssistant(frase));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não consegui entender agora.");
    } finally {
      setPensando(false);
    }
  }

  function ditar() {
    const SR = getSpeechRecognition();
    if (!SR) return;
    const r = new SR();
    reconhecimento.current = r;
    r.lang = "pt-BR";
    r.interimResults = false;
    r.onresult = (e) => {
      const frase = e.results[0][0].transcript;
      setTexto(frase);
      void perguntar(frase);
    };
    r.onerror = () => setOuvindo(false);
    r.onend = () => setOuvindo(false);
    setOuvindo(true);
    r.start();
  }

  /** Executa o que o usuário confirmou. Cada ação vai pelo mesmo endpoint do
   *  formulário, então as validações e as checagens do servidor são as mesmas. */
  async function confirmar(acoes: AcaoProposta[]) {
    setSalvando(true);
    let feitas = 0;
    for (const acao of acoes) {
      const t = acao.transacao;
      const card = (cards ?? []).find(
        (c) => t.creditCardNickname && c.nickname.toLowerCase() === t.creditCardNickname.toLowerCase(),
      );
      const wallet = (wallets ?? []).find(
        (w) => t.walletName && w.name.toLowerCase() === t.walletName.toLowerCase(),
      );
      try {
        await criar.mutateAsync({
          type: t.type,
          amount: t.amount,
          date: t.date,
          category: t.category,
          description: t.description,
          ...(t.installmentTotal > 1 ? { installmentTotal: t.installmentTotal } : {}),
          ...(card ? { creditCardId: card.id, invoiceChoice: "CURRENT" as const } : {}),
          ...(!card && wallet ? { walletId: wallet.id } : {}),
        });
        feitas += 1;
      } catch {
        /* segue para as próximas; o resumo no fim diz quantas entraram */
      }
    }
    setSalvando(false);
    onOpenChange(false);
    if (feitas === acoes.length) {
      toast.success(feitas === 1 ? "Lançamento criado." : `${feitas} lançamentos criados.`);
    } else {
      toast.error(`Criei ${feitas} de ${acoes.length}. Confira a lista de transações.`);
    }
  }

  const acoes = resultado?.acoes ?? [];
  const temVoz = getSpeechRecognition() !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-[520px] sm:rounded-[26px]">
        <div className="rounded-t-2xl bg-[image:var(--spot)] px-5 py-5 text-spot-fg sm:rounded-t-[26px] sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 flex-none items-center justify-center rounded-full bg-[color:var(--spot-line)]">
              <Sparkles className="size-4" />
            </span>
            <DialogTitle className="text-[15px] font-semibold text-spot-fg">Assistente</DialogTitle>
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => onOpenChange(false)}
              className="ml-auto flex size-8 items-center justify-center rounded-full text-spot-fg-2 transition-colors hover:bg-white/15 hover:text-spot-fg"
            >
              <X className="size-4" />
            </button>
          </div>
          <DialogDescription className="sr-only">
            Escreva ou fale o que você gastou e confirme antes de salvar.
          </DialogDescription>

          <div className="mt-4 flex items-end gap-2">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void perguntar(texto);
                }
              }}
              rows={2}
              placeholder="gastei 45 no posto pelo Nubank"
              className="max-h-28 min-h-[46px] w-full resize-none rounded-[13px] bg-black/25 px-3.5 py-2.5 text-[14px] text-spot-fg outline-none placeholder:text-spot-fg-2/70"
            />
            {temVoz && (
              <button
                type="button"
                aria-label="Ditar"
                onClick={ditar}
                disabled={pensando}
                className={cn(
                  "flex size-11 flex-none items-center justify-center rounded-full transition-colors disabled:opacity-50",
                  ouvindo ? "bg-negative text-white" : "bg-[color:var(--spot-line)] text-spot-fg hover:bg-white/20",
                )}
              >
                <Mic className="size-4" />
              </button>
            )}
            <button
              type="button"
              aria-label="Enviar"
              onClick={() => void perguntar(texto)}
              disabled={pensando || !texto.trim()}
              className="flex size-11 flex-none items-center justify-center rounded-full bg-spot-accent text-side-accent-ink transition-opacity disabled:opacity-40"
            >
              {pensando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
          {ouvindo && <p className="mt-2 text-[12px] text-spot-accent">Ouvindo… pode falar.</p>}
        </div>

        <div className="flex max-h-[52vh] flex-col gap-3 overflow-y-auto px-5 py-5 sm:px-6">
          {!resultado && !pensando && (
            <>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-5">Experimente</span>
              <div className="flex flex-col gap-2">
                {EXEMPLOS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setTexto(ex);
                      void perguntar(ex);
                    }}
                    className="rounded-[12px] border border-divider bg-surface-inset px-3.5 py-2.5 text-left text-[13.5px] text-text-3 transition-colors hover:border-divider-strong hover:text-text"
                  >
                    “{ex}”
                  </button>
                ))}
              </div>
              <p className="text-[12.5px] leading-[1.5] text-text-4">
                Por enquanto só sei lançar entradas e saídas. Nada é salvo sem você confirmar.
              </p>
            </>
          )}

          {pensando && (
            <div className="flex items-center gap-2.5 py-6 text-[14px] text-text-4">
              <Loader2 className="size-4 animate-spin" /> Lendo o que você escreveu…
            </div>
          )}

          {resultado && (
            <>
              <p className="text-[14px] leading-[1.55] text-text-2">{resultado.resposta}</p>

              {acoes.map((acao, i) => {
                const t = acao.transacao;
                const entrada = t.type === "INCOME";
                return (
                  <div key={i} className="flex flex-col gap-2 rounded-[14px] bg-surface-inset p-3.5">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "font-mono text-[20px] font-semibold tabular-nums",
                          entrada ? "text-positive" : "text-negative",
                        )}
                      >
                        {entrada ? "+ " : "− "}
                        {formatCurrency(t.amount)}
                      </span>
                      <span className="ml-auto font-mono text-[12.5px] text-text-4">{formatDate(t.date)}</span>
                    </div>
                    <div className="text-[13.5px] text-text">{t.description || t.category}</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-track px-2.5 py-0.5 text-[11.5px] text-text-3">{t.category}</span>
                      {t.creditCardNickname && (
                        <span className="rounded-full bg-brand-tint px-2.5 py-0.5 text-[11.5px] font-semibold text-brand">
                          {t.creditCardNickname}
                        </span>
                      )}
                      {t.walletName && (
                        <span className="rounded-full bg-info-tint px-2.5 py-0.5 text-[11.5px] font-semibold text-info">
                          {t.walletName}
                        </span>
                      )}
                      {t.installmentTotal > 1 && (
                        <span className="rounded-full bg-warning-tint px-2.5 py-0.5 text-[11.5px] font-semibold text-warning">
                          {t.installmentTotal}×
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {resultado.duvidas.length > 0 && (
                <ul className="flex flex-col gap-1 rounded-[13px] bg-warning-tint px-3.5 py-3">
                  {resultado.duvidas.map((d) => (
                    <li key={d} className="text-[12.5px] leading-[1.45] text-warning">
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {acoes.length > 0 && (
          <div className="flex gap-2.5 border-t border-divider bg-surface-inset px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => setResultado(null)}
              className="rounded-full border border-divider px-4 py-2.5 text-[14px] text-text-3 transition-colors hover:text-text"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={() => void confirmar(acoes)}
              disabled={salvando}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-[14px] font-semibold text-brand-ink transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {salvando && <Loader2 className="size-4 animate-spin" />}
              {acoes.length === 1 ? "Confirmar e lançar" : `Confirmar ${acoes.length} lançamentos`}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
