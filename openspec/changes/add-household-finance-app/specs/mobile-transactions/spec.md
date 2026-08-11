## Purpose

Permite ao usuário ver, criar, editar e excluir suas próprias transações (entradas e saídas), incluindo o vínculo opcional a um cartão de crédito e a escolha de fatura.

## ADDED Requirements

### Requirement: Listagem de transações
O app SHALL listar as transações do usuário autenticado, mais recentes primeiro, consumindo `GET /transactions`.

#### Scenario: Lista com transações
- **WHEN** a tela de transações é aberta e existem transações do usuário
- **THEN** o app exibe cada transação com data, descrição, categoria e valor (destacando entrada/saída visualmente)

#### Scenario: Lista vazia
- **WHEN** a tela de transações é aberta e o usuário não tem nenhuma transação
- **THEN** o app exibe um estado vazio com uma chamada para criar a primeira transação

### Requirement: Filtro de transações
O app SHALL permitir filtrar a lista de transações por período, categoria e tipo (entrada/saída).

#### Scenario: Aplicar filtro de período
- **WHEN** o usuário define uma data inicial e final no filtro
- **THEN** o app rebusca as transações passando `from`/`to` e exibe apenas as do período

### Requirement: Criação de transação
O app SHALL permitir criar uma nova transação por meio de um formulário (modal), com tipo, valor, data, categoria e descrição opcional.

#### Scenario: Criação de transação simples
- **WHEN** o usuário preenche tipo, valor, data e categoria válidos e confirma
- **THEN** o app envia `POST /transactions` e, em caso de sucesso, fecha o modal e atualiza a lista

#### Scenario: Envio com valor inválido
- **WHEN** o usuário tenta confirmar com um valor vazio, zero ou negativo
- **THEN** o app impede o envio e exibe uma mensagem de validação, sem chamar o backend

### Requirement: Vínculo a cartão e escolha de fatura na criação
Ao criar uma transação de saída, o app SHALL permitir selecionar um cartão de crédito do usuário e escolher se ela entra na fatura atual ou na próxima.

#### Scenario: Transação de saída vinculada a um cartão
- **WHEN** o usuário marca uma transação de saída como vinculada a um cartão próprio e escolhe "fatura atual" ou "próxima fatura"
- **THEN** o app envia `creditCardId` e a escolha de fatura junto com a transação em `POST /transactions`

#### Scenario: Transação de entrada não permite vínculo a cartão
- **WHEN** o usuário seleciona o tipo "entrada"
- **THEN** o app oculta a opção de vincular a um cartão

### Requirement: Edição e exclusão de transação própria
O app SHALL permitir editar ou excluir apenas transações do próprio usuário.

#### Scenario: Edição de transação
- **WHEN** o usuário edita uma transação existente e confirma
- **THEN** o app envia `PATCH /transactions/:id` e atualiza a transação na lista

#### Scenario: Exclusão de transação
- **WHEN** o usuário confirma a exclusão de uma transação (com diálogo de confirmação)
- **THEN** o app envia `DELETE /transactions/:id` e remove a transação da lista
