## Purpose

Tela de relatórios do usuário: evolução de gastos nos últimos meses, distribuição por categoria, projeção de saldo e uma comparação de totais entre os dois membros do household e a visão unificada.

## ADDED Requirements

### Requirement: Evolução de gastos dos últimos 6 meses
O app SHALL exibir um gráfico de barras com o total de saídas do usuário autenticado em cada um dos últimos 6 meses.

#### Scenario: Cálculo da evolução mensal
- **WHEN** a tela de relatórios é aberta
- **THEN** o app busca as transações de saída dos últimos 6 meses (`GET /transactions` filtrado por período e tipo) e agrega o total por mês para montar o gráfico

### Requirement: Gastos por categoria no mês atual
O app SHALL exibir a distribuição de gastos por categoria do mês corrente do usuário autenticado.

#### Scenario: Carregamento do resumo por categoria
- **WHEN** a tela de relatórios é aberta
- **THEN** o app busca `GET /dashboard/by-category` para o período do mês corrente e exibe uma barra por categoria com o valor total

### Requirement: Projeção de saldo
O app SHALL exibir a projeção de saldo do usuário autenticado para os próximos meses, incluindo o valor projetado para o fim do mês corrente.

#### Scenario: Carregamento da projeção
- **WHEN** a tela de relatórios é aberta
- **THEN** o app busca `GET /dashboard/projection` e exibe o saldo atual, o total de contas pendentes, o total de faturas pendentes e a projeção para o fim do mês corrente

### Requirement: Comparação individual vs. unificado
Quando o usuário autenticado pertence a um household, o app SHALL exibir uma tabela comparando os totais (entradas, saídas, saldo, dívidas) do próprio usuário, do parceiro/parceira e da visão unificada.

#### Scenario: Household ativo
- **WHEN** o usuário autenticado pertence a um household ativo
- **THEN** o app busca `GET /dashboard/me`, `GET /dashboard/member/:partnerId` e `GET /dashboard/household` e monta a tabela comparativa com as três colunas

#### Scenario: Sem household
- **WHEN** o usuário autenticado não pertence a um household
- **THEN** a tabela comparativa não é exibida
