import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAIStatus, useGenerateMonthlyInsight, useMonthlyInsight } from "@/hooks/useAI";

function formatGeneratedAt(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function MonthlyInsightCard({ scope, month }: { scope?: string; month?: string }) {
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
    <section className="flex flex-col gap-3 rounded-[18px] border border-divider bg-surface px-4 py-5 shadow-[var(--shadow-card)] sm:px-[22px]">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 flex-none text-brand" />
        <h2 className="flex-1 text-[14.5px] font-semibold text-text">Análise do mês</h2>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className={cn(
            "flex flex-none items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px] font-semibold transition-opacity disabled:opacity-60",
            data ? "border border-divider bg-surface text-text-3" : "bg-brand text-brand-ink",
          )}
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : data ? (
            <RefreshCw className="size-3.5" />
          ) : null}
          {loading ? "Analisando..." : data ? "Refazer" : "Analisar meu mês"}
        </button>
      </div>

      {!data && !loading && (
        <p className="text-[12.5px] text-text-4">
          A IA lê seus números do mês — renda, tetos, contas fixas e cartões — e aponta onde cortar para fechar no
          azul. Cada análise é gerada sob demanda e fica guardada até você pedir de novo.
        </p>
      )}

      {data && (
        <>
          <div
            className={cn(
              "rounded-xl px-3.5 py-3 text-[13px] leading-relaxed",
              data.vaiFecharNoAzul ? "bg-brand-tint text-text" : "bg-negative-tint text-text",
            )}
          >
            {data.resumo}
          </div>

          {data.pontosDeAtencao.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10.5px] font-semibold tracking-[0.12em] text-text-4">PONTOS DE ATENÇÃO</span>
              <ul className="flex flex-col gap-1.5">
                {data.pontosDeAtencao.map((ponto) => (
                  <li key={ponto} className="flex gap-2 text-[12.5px] text-text-3">
                    <span className="mt-[7px] size-1 flex-none rounded-full bg-text-5" />
                    <span>{ponto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.acoes.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10.5px] font-semibold tracking-[0.12em] text-text-4">ONDE CORTAR</span>
              {data.acoes.map((acao) => (
                <div key={acao.titulo} className="flex flex-col gap-1 rounded-xl border border-divider bg-surface-2 px-3.5 py-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="flex-1 text-[13px] font-medium text-text">{acao.titulo}</span>
                    {acao.economiaMensal > 0 && (
                      <span className="font-mono text-[12.5px] text-positive">
                        + {formatCurrency(acao.economiaMensal)}/mês
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-text-4">{acao.comoFazer}</span>
                </div>
              ))}
            </div>
          )}

          <span className="text-[11px] text-text-5">
            Gerada em {formatGeneratedAt(data.generatedAt)} · números do mês {String(data.month).padStart(2, "0")}/
            {data.year}
          </span>
        </>
      )}
    </section>
  );
}
