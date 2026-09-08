import type { AcaoProposta } from "@/api/types";

/** "R$ 45,90" lido em voz alta sai como "R cifrão quarenta e cinco vírgula
 *  noventa". Montamos a frase a partir do número para ela soar como alguém
 *  falaria: "quarenta e cinco reais e noventa centavos". */
export function valorFalado(valor: number): string {
  const centavos = Math.round(Math.abs(valor) * 100);
  const reais = Math.floor(centavos / 100);
  const resto = centavos % 100;

  const parteReais = `${reais} ${reais === 1 ? "real" : "reais"}`;
  if (resto === 0) return parteReais;
  return `${parteReais} e ${resto} ${resto === 1 ? "centavo" : "centavos"}`;
}

/** Frase que a JulIA lê de volta para confirmação de mãos ocupadas. Montada dos
 *  dados, não do resumo em texto, para o valor sair falado como gente fala. */
export function fraseDaAcao(acao: AcaoProposta): string {
  const t = acao.transacao;
  // O valor fica colado no início ("Saída de 45 reais"); só os complementos
  // levam vírgula, senão a fala sai picotada.
  const inicio = `${t.type === "INCOME" ? "Entrada" : "Saída"} de ${valorFalado(t.amount)}`;
  const detalhes = [
    t.category ? `em ${t.category}` : "",
    t.creditCardNickname ? `no cartão ${t.creditCardNickname}` : "",
    t.walletName ? `no ${t.walletName}` : "",
    t.installmentTotal > 1 ? `em ${t.installmentTotal} vezes` : "",
  ].filter(Boolean);
  return detalhes.length > 0 ? `${inicio} ${detalhes.join(", ")}` : inicio;
}

export function fraseDeConfirmacao(acoes: AcaoProposta[]): string {
  if (acoes.length === 0) return "";
  if (acoes.length === 1) return `${fraseDaAcao(acoes[0])}. Confirma?`;
  return `${acoes.length} lançamentos. ${acoes.map(fraseDaAcao).join(". ")}. Confirma?`;
}

/** A síntese de voz do navegador é local e gratuita: não gasta token nenhum,
 *  ao contrário de pedir áudio ao modelo. */
export function podeFalar(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function falar(texto: string): void {
  if (!podeFalar() || !texto) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.rate = 1.05;
  window.speechSynthesis.speak(fala);
}

export function calar(): void {
  if (podeFalar()) window.speechSynthesis.cancel();
}
