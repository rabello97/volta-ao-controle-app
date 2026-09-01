/** "1 conta" / "3 contas" — evita o "(s)" que deixa a interface com cara de
 *  rascunho. O plural vem pronto porque em português nem sempre é só o "s". */
export function plural(count: number, singular: string, pluralForm?: string): string {
  const palavra = count === 1 ? singular : (pluralForm ?? `${singular}s`);
  return `${count} ${palavra}`;
}
