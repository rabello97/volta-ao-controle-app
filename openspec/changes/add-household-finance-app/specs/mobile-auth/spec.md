## Purpose

Permite que cada pessoa do casal entre no app com sua própria conta (e-mail/senha ou Google) e, uma vez autenticado, alterne entre a própria visão e a do parceiro/parceira dentro do household.

## ADDED Requirements

### Requirement: Login com e-mail e senha
O app SHALL permitir que o usuário se autentique informando e-mail e senha, usando o endpoint de login do backend.

#### Scenario: Login com credenciais corretas
- **WHEN** o usuário informa e-mail e senha corretos e confirma
- **THEN** o app armazena a sessão (token) e navega para o dashboard

#### Scenario: Login com credenciais incorretas
- **WHEN** o usuário informa e-mail ou senha incorretos
- **THEN** o app exibe uma mensagem de erro e mantém o usuário na tela de login

### Requirement: Login com Google
O app SHALL oferecer, na tela de login, uma opção alternativa de entrar com a conta Google do usuário.

#### Scenario: Login com Google bem-sucedido
- **WHEN** o usuário escolhe "Entrar com Google" e conclui o fluxo de autenticação do Google com sucesso
- **THEN** o app envia o token do Google para o backend, recebe a sessão do app e navega para o dashboard

#### Scenario: Cancelamento do fluxo Google
- **WHEN** o usuário cancela o fluxo de login do Google antes de concluir
- **THEN** o app permanece na tela de login sem exibir erro bloqueante

### Requirement: Persistência de sessão
O app SHALL manter o usuário autenticado entre aberturas do app até logout explícito ou expiração do token.

#### Scenario: Reabertura do app com sessão válida
- **WHEN** o usuário reabre o app e há uma sessão válida armazenada
- **THEN** o app pula a tela de login e vai direto para o dashboard

#### Scenario: Logout
- **WHEN** o usuário toca em "Sair"
- **THEN** o app limpa a sessão armazenada e retorna para a tela de login

### Requirement: Alternância entre visão individual e unificada no dashboard
Após autenticado, o usuário SHALL poder alternar, através de um controle no topo do dashboard, entre sua própria visão, a do parceiro/parceira do household e a visão unificada. Essa alternância afeta apenas o dashboard (totais de entradas, saídas, saldo e dívidas) e a tabela comparativa de relatórios — as demais telas (transações, contas recorrentes, cartões e os gráficos de relatórios) permanecem sempre sobre os dados do próprio usuário autenticado, pois o backend não expõe listagens desses dados para outro membro.

#### Scenario: Troca para a visão do parceiro no dashboard
- **WHEN** o usuário autenticado seleciona o nome do outro membro do household no controle de visão do dashboard
- **THEN** o dashboard passa a exibir os totais individuais desse membro (somente leitura), consultados via `GET /dashboard/member/:userId`

#### Scenario: Troca para a visão unificada no dashboard
- **WHEN** o usuário autenticado seleciona "Unificado" no controle de visão do dashboard
- **THEN** o dashboard passa a exibir a soma dos totais dos dois membros do household

#### Scenario: Usuário sem household ainda
- **WHEN** o usuário autenticado ainda não pertence a um household
- **THEN** o controle de visão exibe apenas a opção individual, sem opção de parceiro ou unificado
