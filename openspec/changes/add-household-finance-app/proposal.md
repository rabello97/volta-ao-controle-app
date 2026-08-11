## Why

O casal precisa de uma interface web para acompanhar as finanças descritas no backend (`volta-ao-controle-api`): transações, contas recorrentes, cartões/faturas e uma visão de dashboard individual e unificada. Hoje não existe nenhuma tela implementada — só um protótipo visual estático (`design-reference/NósFinanças.dc.html`) que define a identidade visual e o fluxo de telas a ser seguido. O app SHALL ser um PWA (instalável, web normal) — sem app nativo neste change.

## What Changes

- Web app (PWA) novo, do zero, em React + Vite, consumindo a API do repositório backend. Instalável (manifest + ícones), responsivo (funciona tanto em desktop quanto em navegador mobile).
- Tela de login com e-mail/senha e, opcionalmente, login com Google (consumindo `POST /auth/login` e `POST /auth/google`).
- Troca de perfil / alternância de visão (Rodrigo, Bruna, Unificado) através de um controle segmentado no topo das telas principais, refletindo `GET /household` e os endpoints de dashboard individual/unificado.
- Dashboard com saldo, alertas de contas próximas do vencimento e resumo de próximos vencimentos.
- Tela de transações: listagem com filtro, criação/edição via modal (com vínculo opcional a cartão e escolha de fatura atual/próxima).
- Tela de contas recorrentes: listagem e criação via modal.
- Tela de cartões: lista de cartões com fatura atual e tela de detalhe da fatura (transações do mês).
- Tela de relatórios: evolução de gastos (6 meses), gastos por categoria, projeção de saldo e comparação individual vs. unificado.

## Capabilities

### New Capabilities
- `mobile-auth`: login (e-mail/senha e Google), sessão do app, troca/seleção de perfil dentro do household.
- `mobile-dashboard`: tela inicial com saldo, alertas e próximos vencimentos, individual e unificada.
- `mobile-transactions`: listagem e criação/edição de transações, incluindo vínculo a cartão/fatura.
- `mobile-recurring-bills`: listagem e criação de contas recorrentes.
- `mobile-credit-cards`: lista de cartões e detalhe de fatura por cartão.
- `mobile-reports`: relatórios (evolução mensal, por categoria, projeção, comparação individual/unificado).

### Modified Capabilities
(nenhuma — projeto frontend greenfield, sem specs existentes)

## Impact

- Repositório frontend (este repo), atualmente sem código de aplicação — implementação parte do zero.
- Consome a API do repositório backend `volta-ao-controle-api` (mudança `add-household-finance-api`): auth, household, transactions, recurring-bills, credit-cards, dashboard.
- Usa `design-reference/` (protótipo estático em HTML) como referência visual de layout, paleta de cores, tipografia e fluxo de telas — não é código a ser importado, apenas referência de design.
