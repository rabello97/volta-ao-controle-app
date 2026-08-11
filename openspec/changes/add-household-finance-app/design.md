## Context

Repositório frontend vazio (sem código de app, sem stack definida). Consome a API definida em `volta-ao-controle-api` (change `add-household-finance-api`): auth (e-mail/senha e Google), household, transactions, recurring-bills, credit-cards, dashboard (incluindo `GET /dashboard/member/:userId`). A referência visual é `design-reference/NósFinanças.dc.html` — um protótipo estático (formato "design canvas", não é código React nativo), que define layout, paleta de cores, tipografia e as telas: login, dashboard, transações, contas recorrentes, cartões, detalhe de fatura e relatórios.

## Goals / Non-Goals

**Goals:**
- Definir stack técnica mínima para uma web app (PWA) nova, em React + TypeScript.
- Definir navegação e telas cobrindo as capacidades do proposal.
- Reaproveitar a identidade visual do protótipo (cores, tipografia, formas) 1:1, já que é um alvo web (CSS aceita `oklch()` nativamente).
- Definir como o app consome cada endpoint do backend, incluindo autenticação e persistência de sessão.
- Tornar o app instalável (manifest + ícones) e com uma sensação de app nativo (transições suaves entre telas, micro-interações), mesmo sendo "web normal".

**Non-Goals:**
- App nativo (iOS/Android via loja) — fora do escopo deste change; PWA é o único alvo.
- Modo offline completo com sincronização de dados (fora do escopo) — o service worker do PWA cacheia o app shell (HTML/JS/CSS/ícones) para abrir rápido e ser instalável, mas não cacheia dados da API para uso sem internet.
- Notificações push (fora do escopo).
- Editar/excluir transações do parceiro de household (backend não expõe isso — ver `mobile-auth`, escopo da troca de visão).
- Deploy em hospedagem de produção (Vercel/Netlify/etc.) — este change cobre o app funcional local/build estático; hospedagem é decisão operacional separada.

## Decisions

### Stack
- **Build/framework**: Vite + React + TypeScript — SPA padrão, sem servidor, mais leve e mais rápido de iterar que um meta-framework para este escopo.
- **Roteamento**: `react-router-dom`, com rotas por tela (`/login`, `/dashboard`, `/transactions`, `/recurring-bills`, `/credit-cards`, `/credit-cards/:id`, `/reports`) — URLs reais, back/forward do navegador funcionando, pré-requisito natural de um PWA "web normal".
- **Estilo**: Tailwind CSS, com os tokens do protótipo (cores `oklch`, fontes) direto no `tailwind.config.ts` como tema customizado — CSS no navegador aceita `oklch()` nativamente, então os valores do protótipo são reaproveitados sem conversão.
- **Componentes de UI**: shadcn/ui (Radix UI + Tailwind) para os primitivos interativos — modal (Dialog), segmented control (Tabs), dropdown, toast, form fields. Copiados para `src/components/ui/`, não é uma dependência de runtime fechada — dá controle total de estilo para bater com o protótipo, e já vem com animações de abrir/fechar (`tailwindcss-animate`) e acessibilidade (foco, teclado) prontas.
- **Transições e micro-interações**: `framer-motion` para transição entre rotas (fade/slide suave ao trocar de tela) e para elementos que aparecem/mudam de valor (ex.: números do dashboard, barras dos gráficos) — é o que dá a "sensação de app" pedida, por cima da base já animada do shadcn/Radix.
- **Dados/rede**: `@tanstack/react-query` para cache e estados de loading/erro das chamadas HTTP; `fetch` nativo com um client fino em `src/api/client.ts` que injeta o header `Authorization`.
- **Sessão**: token JWT em `localStorage`, com um wrapper `src/lib/session.ts` (facilita trocar a estratégia de armazenamento depois, se necessário). Risco de XSS aceito conscientemente por ora — é um app pessoal do casal, sem dados de pagamento trafegando no frontend (ver Risks).
- **Login com Google**: `@react-oauth/google` (wrapper sobre o Google Identity Services do navegador) — botão "Entrar com Google" retorna um `id_token`, que o app envia para `POST /auth/google` no backend (mesmo contrato do design do backend).
- **Formulários**: `react-hook-form` + `zod` (via `@hookform/resolvers`) para os modais de criação (transação, conta recorrente, cartão) — combinação padrão usada pelos componentes de formulário do shadcn/ui.
- **Gráficos**: implementação própria com `<div>`/CSS (barras com altura/largura proporcional, como o próprio protótipo já faz) animadas com `framer-motion` — sem biblioteca de charts, mantém consistência visual com o protótipo.
- **Ícones**: `lucide-react` — mesma biblioteca (`lucide`) usada no protótipo, versão React para web.
- **PWA**: `vite-plugin-pwa` (Workbox por baixo dos panos) — gera `manifest.webmanifest` (nome, ícones, `theme_color`, `background_color`) e um service worker que cacheia o app shell, deixando o app instalável ("Adicionar à tela inicial" / instalar pelo navegador desktop).
- **Testes**: Vitest + `@testing-library/react` (mesmo runner do Vite, rápido, sem config extra de transpilação).

Alternativas consideradas: Next.js (descartado — SSR/servidor não traz benefício aqui, é um SPA autenticado, e Vite é mais simples de rodar/deployar como estático); Expo + React Native Web (descartado após esclarecimento do usuário — o alvo é "web normal", não um app com ambição de virar nativo depois; carregar a camada de compatibilidade RN-web seria peso sem benefício); Zustand/Redux para estado global (descartado por ora — React Query cobre o estado de servidor, e sessão/visão selecionada cabem em Context API simples).

### Tokens de design (extraídos do protótipo, usados como estão)
- `background`: oklch(96.8% 0.005 258), `surface`: #ffffff, `text`: oklch(24% 0.014 258), `text-muted`: oklch(52% 0.014 258), `text-faint`: oklch(64% 0.012 258)
- `divider`: oklch(90% 0.006 258), `track`: oklch(92% 0.006 258)
- `accent`: oklch(53% 0.17 264), `accent-hover`: oklch(47% 0.175 264), `accent-tint`: oklch(94% 0.03 264)
- `positive`: oklch(56% 0.135 148), `positive-tint`: oklch(93% 0.045 148)
- `negative`: oklch(56% 0.16 21), `negative-tint`: oklch(94% 0.035 21)

Definidos como CSS custom properties em `src/index.css` e mapeados no `tailwind.config.ts` (`colors: { accent: 'var(--accent)', ... }`), para usar como classes Tailwind (`bg-accent`, `text-negative`, etc.) mantendo os valores idênticos ao protótipo. Tipografia: `Sora` (títulos, peso 700/800) e `Inter` (corpo), carregadas via `@fontsource/sora` e `@fontsource/inter` (self-hosted, funciona offline/PWA sem depender do Google Fonts em runtime).

### Autenticação e sessão
- Tela de login com campos e-mail/senha (`POST /auth/login`) e botão "Entrar com Google" (`POST /auth/google`), ambos retornando `{ token, user }` — o token vai para `localStorage` via `src/lib/session.ts` e passa a ser enviado em todas as chamadas autenticadas.
- Ao abrir o app, um `AuthProvider` verifica se há token salvo; se houver, tenta uma chamada leve autenticada (`GET /dashboard/me`) para validar a sessão antes de pular a tela de login.
- Rotas autenticadas ficam atrás de um `<RequireAuth>` no `react-router-dom` que redireciona para `/login` sem sessão válida.
- Logout limpa o token do `localStorage` e o cache do React Query.

### Visão selecionada (própria / parceiro / unificada)
Um `HouseholdViewProvider` mantém o estado da visão selecionada (`self | partner | household`) e o resultado de `GET /household` (para saber se há parceiro e obter seu `userId`/nome). O dashboard e a tabela comparativa de relatórios leem esse estado; as demais telas ignoram-no e sempre operam sobre o usuário autenticado (ver limite documentado em `mobile-auth`).

### Estrutura de pastas
```
src/
  api/          client HTTP + funções por recurso (auth, household, transactions, recurringBills, creditCards, dashboard)
  components/
    ui/         componentes shadcn/ui (Dialog, Tabs, Button, Input, ...)
    ...         componentes compartilhados do app (EmptyState, SegmentedControl, BarChart, AlertBanner)
  routes/       páginas por rota (Login, Dashboard, Transactions, RecurringBills, CreditCards, CardDetail, Reports)
  hooks/        hooks de dados (useDashboard, useTransactions, ...) por cima do React Query
  context/      AuthProvider, HouseholdViewProvider
  lib/          session (armazenamento de token), utils
```

## Risks / Trade-offs

- [Risco] Escolha de stack (Vite/Tailwind/shadcn/React Query) feita sem confirmação linha a linha do usuário → Mitigação: registrada aqui como decisão explícita a partir do que foi pedido (TS, Tailwind, shadcn, transições suaves), fácil de revisar antes da fase de apply.
- [Risco] Token JWT em `localStorage` é acessível por qualquer script rodando na página (risco de XSS) → Mitigação: app pessoal sem inserir HTML não confiável, dependências mantidas atualizadas; documentado como aceito conscientemente para o v1, revisável depois (ex.: cookie httpOnly exigiria um backend-for-frontend, fora de escopo agora).
- [Risco] `@react-oauth/google` exige um Client ID OAuth do tipo "Web application" no Google Cloud Console, com a origem do app autorizada, e deve bater com o `GOOGLE_CLIENT_ID` configurado no backend → Mitigação: documentar como variável de ambiente do Vite (`VITE_GOOGLE_CLIENT_ID` em `.env`), sem valor real commitado.
- [Risco] Escopo da "troca de visão" ficou menor do que o protótipo original sugere (protótipo mostra dados do parceiro em transações também) → Mitigação: decisão consciente registrada em `mobile-auth`, pois o backend atual não expõe listagem de transações de outro membro; pode virar um change futuro se o casal quiser essa visão detalhada do parceiro.
- [Risco] Service worker do PWA pode servir uma versão em cache desatualizada do app após um deploy → Mitigação: `vite-plugin-pwa` com estratégia `registerType: 'autoUpdate'`, atualizando o cache em segundo plano a cada visita.

## Migration Plan

Não aplicável — projeto novo, sem usuários ou build existente. Primeira implementação parte do zero.
