/** Converte o que a pessoa digita num campo de dinheiro para número.
 *
 *  O app é pt-BR: "1.234,56" é o formato natural, e `Number()` devolve NaN
 *  para ele. A regra segue o que a pessoa escreveu:
 *  - tem vírgula  → a vírgula é o decimal e os pontos são separadores de milhar
 *  - só tem ponto → o ponto é o decimal (quem digita "123.45" quer 123,45)
 */
export function parseMoney(entrada: unknown): unknown {
  if (typeof entrada !== "string") return entrada;
  const texto = entrada.trim();
  if (texto === "") return entrada;

  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;

  const numero = Number(normalizado);
  return Number.isNaN(numero) ? entrada : numero;
}
