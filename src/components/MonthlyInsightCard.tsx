import { Loader2, RefreshCw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SpotCard } from "@/components/SpotCard";
import { useAIStatus, useGenerateMonthlyInsight, useMonthlyInsight } from "@/hooks/useAI";

function formatGeneratedAt(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/** O único card escuro do painel. A análise é o conteúdo que se lê como texto,
 *  não como número — por isso é ela que ganha o destaque da direção. */
export function MonthlyInsightCard({ scope, month, className }: { scope?: string; month?: string; className?: string }) {
  const ai = useAIStatus();
  const enabled = ai.data?.enabled ?? false;
  const insight = useMonthlyInsight(scope, enabled, month);
  const generate = useGenerateMonthlyInsight();

  // Sem chave no servidor a seção some — botão que sempre dá erro é pior que
  // botão nenhum.
  if (ai.isLoading || !enabled) return null;

  async function handleGenerate() {
    try {
      await generate.mutateAsync({ scope, month });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não consegui gerar a análise agora.");
    }
  }

  const data = insight.data;
  const loading = generate.isPending;

  return (
    <SpotCard eyebrow="Análise do mês" className={className}>
      {!data && !loading && (
        <>
          <p className="text-[14px] leading-[1.55] text-spot-fg">
            A IA lê os números do mês — renda, tetos, contas fixas e cartões — e aponta onde cortar para fechar no azul.
          </p>
          <p className="text-[13px] leading-[1.5] text-spot-fg-2">
            Cada análise é gerada quando você pede e fica guardada até pedir de novo.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-spot-accent px-4 py-2 text-[13px] font-semibold text-side-accent-ink transition-opacity hover:opacity-90"
          >
            Analisar meu mês <ArrowRight className="size-3.5" />
          </button>
        </>
      )}

      {loading && (
        <div className="flex items-center gap-2.5 py-6 text-[14px] text-spot-fg-2">
          <Loader2 className="size-4 animate-spin" />
          Lendo os números do mês…
        </div>
      )}

      {data && !loading && (
        <>
          <p className="text-[15px] leading-[1.55] text-spot-fg">{data.resumo}</p>

          {data.pontosDeAtencao.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {data.pontosDeAtencao.slice(0, 3).map((ponto) => (
                <li key={ponto} className="flex gap-2 text-[13px] leading-[1.5] text-spot-fg-2">
                  <span className="mt-[7px] size-1 flex-none rounded-full bg-spot-accent" />
                  <span>{ponto}</span>
                </li>
              ))}
            </ul>
          )}

          {data.acoes.length > 0 && (
            <div className="flex flex-col gap-2">
              {data.acoes.slice(0, 2).map((acao) => (
                <div key={acao.titulo} className="flex flex-col gap-0.5 rounded-[13px] bg-[color:var(--spot-line)] px-3.5 py-2.5">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="flex-1 text-[13px] font-semibold text-spot-fg">{acao.titulo}</span>
                    {acao.economiaMensal > 0 && (
                      <span className="font-mono text-[13px] font-semibold text-spot-accent">
                        + {formatCurrency(acao.economiaMensal)}/mês
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] leading-[1.45] text-spot-fg-2">{acao.comoFazer}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
            <span className={cn("text-[11.5px]", data.vaiFecharNoAzul ? "text-spot-accent" : "text-spot-fg-2")}>
              {data.vaiFecharNoAzul ? "Deve fechar no azul" : "Risco de fechar no vermelho"}
              {" · "}
              gerada em {formatGeneratedAt(data.generatedAt)}
            </span>
            <button
              type="button"
              onClick={handleGenerate}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[color:var(--spot-line)] px-3 py-1.5 text-[12px] font-semibold text-spot-fg transition-colors hover:bg-white/20"
            >
              <RefreshCw className="size-3" /> Refazer
            </button>
          </div>
        </>
      )}
    </SpotCard>
  );
}
