## Purpose

Tela inicial do app: mostra de forma rápida o saldo do usuário (ou visão selecionada), alertas de contas próximas do vencimento e os próximos vencimentos, consumindo os endpoints de dashboard do backend.

## ADDED Requirements

### Requirement: Exibição de totais do dashboard
O app SHALL exibir, na tela de dashboard, os totais de entradas, saídas, saldo e dívidas retornados pelo backend para a visão selecionada (própria, do parceiro ou unificada).

#### Scenario: Carregamento do dashboard individual
- **WHEN** a tela de dashboard é aberta com a visão "própria" selecionada
- **THEN** o app busca `GET /dashboard/me` e exibe entradas, saídas, saldo e dívidas retornados

#### Scenario: Carregamento do dashboard unificado
- **WHEN** o usuário seleciona a visão "Unificado"
- **THEN** o app busca `GET /dashboard/household` e exibe os totais somados; se o usuário não tiver household, a opção "Unificado" não é exibida (ver `mobile-auth`)

### Requirement: Alertas de contas próximas do vencimento
O app SHALL destacar, no topo do dashboard, contas recorrentes ou faturas cujo vencimento esteja próximo (dentro de um limite curto de dias).

#### Scenario: Existem contas vencendo em breve
- **WHEN** há contas recorrentes ativas ou faturas com vencimento dentro da janela de alerta
- **THEN** o app exibe um banner de alerta para cada uma, com nome e valor

#### Scenario: Nenhuma conta vencendo em breve
- **WHEN** não há contas recorrentes ou faturas com vencimento na janela de alerta
- **THEN** nenhum banner de alerta é exibido

### Requirement: Lista de próximos vencimentos
O app SHALL exibir uma lista dos próximos vencimentos (contas recorrentes ativas e faturas de cartão em aberto), ordenada por data.

#### Scenario: Existem próximos vencimentos
- **WHEN** há contas recorrentes ativas ou faturas com vencimento futuro
- **THEN** o app lista cada uma com nome, valor e data de vencimento, ordenadas da mais próxima para a mais distante

#### Scenario: Nenhum próximo vencimento
- **WHEN** não há contas recorrentes ativas nem faturas em aberto
- **THEN** o app exibe um estado vazio informativo no lugar da lista

### Requirement: Estado de carregamento e erro
O app SHALL exibir um indicador de carregamento enquanto busca os dados do dashboard e uma mensagem de erro com opção de tentar novamente em caso de falha.

#### Scenario: Falha ao buscar dashboard
- **WHEN** a chamada ao backend falha (erro de rede ou servidor)
- **THEN** o app exibe uma mensagem de erro com um botão para tentar novamente
