## Purpose

Permite ao usuário ver seus cartões de crédito e o detalhe da fatura de cada um, com as transações que a compõem.

## ADDED Requirements

### Requirement: Listagem de cartões
O app SHALL listar os cartões de crédito do usuário autenticado, cada um mostrando o total da fatura atual, consumindo `GET /credit-cards`.

#### Scenario: Lista com cartões cadastrados
- **WHEN** a tela de cartões é aberta e existem cartões cadastrados
- **THEN** o app exibe cada cartão com apelido, total da fatura atual, dia de fechamento e dia de vencimento

#### Scenario: Lista vazia
- **WHEN** o usuário não tem nenhum cartão cadastrado
- **THEN** o app exibe um estado vazio com uma chamada para cadastrar o primeiro cartão

### Requirement: Cadastro de cartão
O app SHALL permitir cadastrar um novo cartão de crédito com apelido, dia de fechamento e dia de vencimento.

#### Scenario: Cadastro válido
- **WHEN** o usuário informa apelido, dia de fechamento e dia de vencimento válidos (fechamento antes do vencimento) e confirma
- **THEN** o app envia `POST /credit-cards` e atualiza a lista de cartões

#### Scenario: Fechamento posterior ao vencimento
- **WHEN** o usuário informa um dia de fechamento igual ou posterior ao dia de vencimento
- **THEN** o app impede o envio e exibe uma mensagem de validação, sem chamar o backend

### Requirement: Detalhe da fatura por mês
Ao selecionar um cartão, o app SHALL exibir o detalhe da fatura do mês corrente (ou de um mês selecionado), com o total e a lista de transações vinculadas, consumindo `GET /credit-cards/:id/invoices/:year/:month`.

#### Scenario: Fatura com transações
- **WHEN** o usuário abre o detalhe de um cartão para um mês com transações vinculadas
- **THEN** o app exibe o total da fatura e uma tabela com data, descrição, categoria e valor de cada transação

#### Scenario: Fatura sem transações
- **WHEN** o usuário abre o detalhe de um cartão para um mês sem transações vinculadas
- **THEN** o app exibe o total zerado e um estado vazio na lista de transações
