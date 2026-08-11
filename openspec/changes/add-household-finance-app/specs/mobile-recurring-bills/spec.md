## Purpose

Permite ao usuário cadastrar e acompanhar suas contas fixas mensais (água, luz, internet etc.), que também alimentam os alertas do dashboard e a projeção de saldo.

## ADDED Requirements

### Requirement: Listagem de contas recorrentes
O app SHALL listar as contas recorrentes do usuário autenticado, consumindo `GET /recurring-bills`.

#### Scenario: Lista com contas cadastradas
- **WHEN** a tela de contas recorrentes é aberta e existem contas cadastradas
- **THEN** o app exibe cada conta com nome, valor esperado, dia de vencimento e categoria

#### Scenario: Lista vazia
- **WHEN** o usuário não tem nenhuma conta recorrente cadastrada
- **THEN** o app exibe um estado vazio com uma chamada para cadastrar a primeira conta

### Requirement: Criação de conta recorrente
O app SHALL permitir criar uma nova conta recorrente por meio de um formulário (modal), com nome, valor esperado, dia de vencimento e categoria.

#### Scenario: Criação válida
- **WHEN** o usuário preenche nome, valor esperado e dia de vencimento (1 a 31) válidos e confirma
- **THEN** o app envia `POST /recurring-bills` e, em caso de sucesso, fecha o modal e atualiza a lista

#### Scenario: Dia de vencimento inválido
- **WHEN** o usuário informa um dia de vencimento fora do intervalo de 1 a 31
- **THEN** o app impede o envio e exibe uma mensagem de validação, sem chamar o backend

### Requirement: Edição e exclusão de conta recorrente própria
O app SHALL permitir editar (incluindo desativar) ou excluir apenas contas recorrentes do próprio usuário.

#### Scenario: Desativar conta recorrente
- **WHEN** o usuário marca uma conta recorrente como inativa
- **THEN** o app envia `PATCH /recurring-bills/:id` com `active: false` e a conta deixa de contar nos alertas e na projeção

#### Scenario: Exclusão de conta recorrente
- **WHEN** o usuário confirma a exclusão de uma conta recorrente
- **THEN** o app envia `DELETE /recurring-bills/:id` e remove a conta da lista
