## 1. Setup do projeto

- [x] 1.1 Criar projeto Vite + React + TypeScript (`npm create vite@latest`), scripts de dev/build/test
- [x] 1.2 Instalar e configurar Tailwind CSS; instalar e configurar shadcn/ui (`components.json`, `src/components/ui`)
- [x] 1.3 Adicionar dependências: `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod` + `@hookform/resolvers`, `framer-motion`, `lucide-react`, `@react-oauth/google`, `@fontsource/sora`, `@fontsource/inter`, `vite-plugin-pwa`
- [x] 1.4 Configurar Vitest + `@testing-library/react` (+ `jsdom`) e script `npm test`
- [x] 1.5 Criar estrutura de pastas (`src/api`, `src/routes`, `src/components`, `src/components/ui`, `src/hooks`, `src/context`, `src/lib`)
- [x] 1.6 Definir tokens de design como CSS custom properties (`src/index.css`) a partir de `design-reference/NósFinanças.dc.html` (paleta `oklch`, fontes Sora/Inter) e mapear via `@theme` (Tailwind v4)
- [x] 1.7 Configurar `vite-plugin-pwa` (manifest: nome, ícones, `theme_color`, `background_color`; `registerType: 'autoUpdate'`)
- [x] 1.8 Criar client HTTP base (`src/api/client.ts`) com injeção do header `Authorization` e tratamento de erro padronizado
- [x] 1.9 Configurar roteamento base (`react-router-dom`) e layout com sidebar (desktop) / navegação inferior (mobile web), com transição de rota via `framer-motion`

## 2. Autenticação e sessão (mobile-auth)

- [x] 2.1 Implementar `src/lib/session.ts` (armazenamento do token em `localStorage`) e `AuthProvider` (estado de sessão, restauração, logout)
- [x] 2.2 Implementar tela de Login: formulário e-mail/senha (`react-hook-form` + `zod`, `POST /auth/login`)
- [x] 2.3 Implementar botão "Entrar com Google" com `@react-oauth/google` (`POST /auth/google`)
- [x] 2.4 Implementar `<RequireAuth>` (rotas protegidas redirecionam para `/login` sem sessão válida)
- [x] 2.5 Implementar `HouseholdViewProvider` (visão own/partner/household, busca `GET /household`)
- [x] 2.6 Implementar `SegmentedControl` de troca de visão no topo do dashboard (componente shadcn `Tabs`)
- [x] 2.7 Testes unitários: reducer/estado do `AuthProvider` (login sucesso/erro, logout, restauração de sessão), lógica do `HouseholdViewProvider` (sem household só mostra opção própria), função de montagem do payload de login Google

## 3. Dashboard (mobile-dashboard)

- [x] 3.1 Implementar hook `useDashboard(view)` (React Query) chamando `/dashboard/me`, `/dashboard/member/:id` ou `/dashboard/household` conforme a visão selecionada
- [x] 3.2 Implementar tela de Dashboard: cards de saldo/entradas/saídas/dívidas
- [x] 3.3 Implementar alertas de vencimento próximo (a partir de contas recorrentes + faturas)
- [x] 3.4 Implementar lista de próximos vencimentos
- [x] 3.5 Implementar estados de carregamento e erro (com retry)
- [x] 3.6 Testes unitários: seleção do endpoint correto por visão no `useDashboard`, função de filtragem/ordenação de próximos vencimentos, função de detecção de alertas (janela de dias)

## 4. Transações (mobile-transactions)

- [x] 4.1 Implementar hooks de dados (`useTransactions`, `useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction`) sobre `/transactions`
- [x] 4.2 Implementar tela de listagem com filtro (período, categoria, tipo)
- [x] 4.3 Implementar modal de criação/edição (tipo, valor, data, categoria, descrição)
- [x] 4.4 Implementar seleção de cartão + escolha de fatura (atual/próxima) quando tipo é saída
- [x] 4.5 Implementar exclusão com confirmação
- [x] 4.6 Testes unitários: validação do formulário (valor inválido, campos obrigatórios), lógica que oculta vínculo a cartão para entradas, montagem do payload de filtro

## 5. Contas recorrentes (mobile-recurring-bills)

- [x] 5.1 Implementar hooks de dados sobre `/recurring-bills`
- [x] 5.2 Implementar tela de listagem
- [x] 5.3 Implementar modal de criação/edição (incluindo alternância ativo/inativo)
- [x] 5.4 Implementar exclusão com confirmação
- [x] 5.5 Testes unitários: validação do formulário (dia de vencimento fora de 1–31, valor inválido)

## 6. Cartões e faturas (mobile-credit-cards)

- [x] 6.1 Implementar hooks de dados sobre `/credit-cards` e `/credit-cards/:id/invoices/:year/:month`
- [x] 6.2 Implementar tela de listagem de cartões
- [x] 6.3 Implementar modal de cadastro de cartão
- [x] 6.4 Implementar tela de detalhe de fatura (total + transações do mês)
- [x] 6.5 Testes unitários: validação do formulário (fechamento ≥ vencimento), formatação do total da fatura

## 7. Relatórios (mobile-reports)

- [x] 7.1 Implementar função de agregação mensal client-side (transações dos últimos 6 meses → total por mês) e hook correspondente
- [x] 7.2 Implementar gráfico de barras de evolução mensal (componente próprio em CSS/`<div>`, animado com `framer-motion`)
- [x] 7.3 Implementar hook e painel de gastos por categoria (`/dashboard/by-category` do mês atual)
- [x] 7.4 Implementar painel de projeção de saldo (`/dashboard/projection`)
- [x] 7.5 Implementar tabela comparativa individual vs. unificado (own/partner/household), oculta quando não há household
- [x] 7.6 Testes unitários: função de agregação mensal (casos com e sem transações em algum mês), montagem da tabela comparativa (com e sem household)

## 8. Revisão final

- [x] 8.1 Rodar toda a suíte de testes e garantir que passam (43/43 testes, 13 arquivos)
- [x] 8.2 Conferir visualmente cada tela contra `design-reference/NósFinanças.dc.html` (cores, tipografia, espaçamento) — verificado a tela de login no navegador (dev server); demais telas não puderam ser verificadas visualmente autenticadas por falta de um Postgres rodando neste ambiente para o backend
- [x] 8.3 Revisar cobertura das specs deste change (todas as capacidades com testes correspondentes)
