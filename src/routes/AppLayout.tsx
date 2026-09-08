import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { LogOut, Users, Settings, ChevronDown, Sun, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { BrandMark } from "@/components/BrandMark";
import { ScanButton } from "@/components/ScanButton";
import { AssistantSheet } from "@/components/AssistantSheet";
import { formatCurrency } from "@/lib/format";
import { useTransactions } from "@/hooks/useTransactions";
import { useRecurringBills } from "@/hooks/useRecurringBills";
import { useCreditCards } from "@/hooks/useCreditCards";
import { useAIStatus } from "@/hooks/useAI";
import { scopeFor } from "@/lib/scope";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { useScanDraft } from "@/context/ScanDraftContext";
import type { ScanResult } from "@/api/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Ícones desenhados a partir dos SVGs inline do mockup (16x16, stroke 1.5). */
const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Painel",
    group: "Mês",
    icon: (
      <>
        <rect x="1.8" y="1.8" width="5" height="5" rx="1.2" />
        <rect x="9.2" y="1.8" width="5" height="5" rx="1.2" />
        <rect x="1.8" y="9.2" width="5" height="5" rx="1.2" />
        <rect x="9.2" y="9.2" width="5" height="5" rx="1.2" />
      </>
    ),
  },
  {
    to: "/transactions",
    label: "Transações",
    group: "Mês",
    icon: <path d="M2 5h10l-2.5-2.5M14 11H4l2.5 2.5" />,
  },
  {
    to: "/reports",
    label: "Relatórios",
    group: "Mês",
    icon: (
      <>
        <circle cx="8" cy="8" r="6.2" />
        <path d="M8 1.8V8h6.2" />
      </>
    ),
  },
  {
    to: "/contas",
    label: "Contas",
    group: "Compromissos",
    icon: (
      <>
        <path d="M2.6 8a5.4 5.4 0 0 1 9.2-3.8M13.4 8a5.4 5.4 0 0 1-9.2 3.8" />
        <path d="M11.4 1.9v2.5h-2.5M4.6 14.1v-2.5h2.5" />
      </>
    ),
  },
  {
    to: "/credit-cards",
    label: "Cartões",
    group: "Compromissos",
    icon: (
      <>
        <rect x="1.5" y="3.5" width="13" height="9" rx="2" />
        <path d="M1.5 6.8h13" />
      </>
    ),
  },
  {
    to: "/casa",
    label: "Casa",
    group: "Casa",
    icon: (
      <>
        <path d="M2 3h1.9l1.7 7.6h6.9l1.6-5.3H4.4" />
        <circle cx="6.6" cy="13" r="1" />
        <circle cx="11.8" cy="13" r="1" />
      </>
    ),
  },
] as const;

const NAV_GROUPS = ["Mês", "Compromissos", "Casa"] as const;

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-none">
      {children}
    </svg>
  );
}

/** Meta de reserva na barra escura: trilho de vidro, preenchimento no acento. */
function SavingsGoalCard({ saved, target }: { saved: number; target: number }) {
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  return (
    <div className="flex flex-col gap-[9px] rounded-[14px] border border-side-line bg-white/[0.06] p-3.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-side-fg">Meta de reserva</span>
        <span className="font-mono text-[12px] font-semibold text-side-accent">{pct}%</span>
      </div>
      <div className="h-[5px] overflow-hidden rounded-[4px] bg-black/25">
        <div className="h-full rounded-[4px] bg-side-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-side-fg-2">
        {formatCurrency(saved)} de {formatCurrency(target)}
      </span>
    </div>
  );
}

function ThemeSegmented({ onDark = false }: { onDark?: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Antes de montar não sabemos o tema resolvido; um placeholder do mesmo
  // tamanho evita o "pulo" de layout e o mismatch de hidratação.
  if (!mounted) return <div className="h-[26px] w-[58px]" aria-hidden="true" />;

  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn("flex gap-0.5 rounded-full p-[3px]", onDark ? "bg-black/25" : "bg-surface-2")}>
      {(
        [
          { key: "light", label: "Tema claro", Icon: Sun },
          { key: "dark", label: "Tema escuro", Icon: Moon },
        ] as const
      ).map(({ key, label, Icon }) => {
        const active = key === (isDark ? "dark" : "light");
        return (
          <button
            key={key}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => setTheme(key)}
            className={cn(
              "flex size-9 items-center justify-center rounded-full transition-colors",
              active
                ? onDark
                  ? "bg-white/15 text-side-on"
                  : "bg-track text-text"
                : onDark
                  ? "text-side-fg-2 hover:bg-white/10 hover:text-side-on"
                  : "text-text-5 hover:bg-track hover:text-text",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Contadores que o mockup mostra à direita de cada item do menu.
  // Os contadores da lateral seguem o mesmo seletor das telas: com "Só a Bruna"
  // eles têm que contar as contas dela, não as suas.
  const { view, partner } = useHouseholdView();
  const scope = scopeFor(view, partner?.id ?? null);

  const transactions = useTransactions({ page: 1, limit: 1, scope });
  const bills = useRecurringBills(scope);
  const cards = useCreditCards(scope);
  const ai = useAIStatus();
  const scanDraft = useScanDraft();
  const [assistenteAberto, setAssistenteAberto] = useState(false);

  const counts: Record<string, number | undefined> = {
    "/transactions": transactions.data?.total,
    "/contas": bills.data?.length,
  };
  const cardsAlert = (cards.data ?? []).some((c) => (c.utilizationPct ?? 0) >= 70);

  /** Escanear pela barra lateral: a leitura entra direto no fluxo que cria o
   *  lançamento e só pergunta o cartão. */
  function handleScanned(result: ScanResult) {
    scanDraft.start(result);
  }

  // A casca é fixa nas quatro bordas em vez de ter altura 100dvh: no PWA em tela
  // cheia do iOS o dvh vem menor que a tela e sobrava uma faixa preta embaixo da
  // barra de navegação. Com inset-0 ela sempre cobre a viewport inteira.
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background text-text sm:grid sm:grid-cols-[236px_1fr] sm:gap-[18px] sm:p-[18px]">
      <aside className="hidden h-full flex-col gap-[22px] overflow-y-auto rounded-[22px] bg-[image:var(--side)] px-4 py-[22px] text-side-fg shadow-[var(--shadow-lift)] sm:flex">
        <div className="flex items-center gap-[11px] px-2">
          <div className="flex size-[30px] flex-none items-center justify-center rounded-[9px] bg-side-accent">
            <BrandMark className="size-[18px] text-side-accent-ink" />
          </div>
          <div className="flex min-w-0 flex-col leading-[1.15]">
            <span className="truncate text-[15px] font-semibold -tracking-[0.01em] text-side-on">Volta ao Controle</span>
            <span className="truncate text-[11px] text-side-fg-2">
              {partner ? `Casa com ${partner.name.split(" ")[0]}` : "Finanças pessoais"}
            </span>
          </div>
        </div>

        {NAV_GROUPS.map((group) => (
          <div key={group} className="flex flex-col">
            <span className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-side-fg-2">
              {group}
            </span>
            <nav className="flex flex-col gap-[3px]">
              {NAV_ITEMS.filter((item) => item.group === group).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-[11px] rounded-[11px] px-[11px] py-[9px] text-[14px] transition-colors",
                      isActive
                        ? "bg-side-active font-semibold text-side-on"
                        : "text-side-fg hover:bg-side-hover hover:text-side-on [&:hover_svg]:text-side-accent",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={isActive ? "text-side-accent" : undefined}>
                        <NavIcon>{item.icon}</NavIcon>
                      </span>
                      {item.label}
                      {counts[item.to] !== undefined && (
                        <span className="ml-auto rounded-full bg-side-line px-[7px] py-px font-mono text-[11px] font-semibold text-side-on">
                          {counts[item.to]}
                        </span>
                      )}
                      {item.to === "/credit-cards" && cardsAlert && (
                        <span className="ml-auto size-1.5 rounded-full bg-warning" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}

        {user && (user.savingsGoalTarget ?? 0) > 0 && (
          <SavingsGoalCard saved={user.savingsGoalSaved ?? 0} target={user.savingsGoalTarget ?? 0} />
        )}

        {ai.data?.enabled && (
          <button
            type="button"
            onClick={() => setAssistenteAberto(true)}
            className="mt-auto flex items-center gap-2.5 rounded-[12px] bg-side-accent px-3 py-2.5 text-left text-side-accent-ink transition-opacity hover:opacity-85 active:scale-[0.98]"
          >
            <Sparkles className="size-4 flex-none" />
            <span className="text-[13.5px] font-semibold">Falar com a JulIA</span>
          </button>
        )}

        {ai.data?.enabled && (
          <div className="rounded-[16px] border border-side-line bg-white/[0.07] p-[15px]">
            <b className="mb-1 block text-[13.5px] font-semibold text-side-on">Escanear nota</b>
            <p className="mb-3 text-[12.5px] leading-[1.5] text-side-fg-2">
              Escolha a foto do cupom ou o print do banco e a transação entra sozinha.
            </p>
            <ScanButton
              onScanned={handleScanned}
              label="Escolher imagem"
              className="w-full justify-center rounded-[9px] border-transparent bg-side-accent py-2 text-[13px] font-semibold text-side-accent-ink transition-opacity hover:opacity-85 hover:text-side-accent-ink active:scale-[0.98]"
            />
          </div>
        )}

        <div className={cn("flex flex-col gap-3 border-t border-side-line pt-4", !ai.data?.enabled && "mt-auto")}>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-side-fg-2">Tema</span>
            <ThemeSegmented onDark />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-[11px] px-2 py-1.5 text-left transition-colors hover:bg-side-hover"
              >
                <div className="flex size-8 flex-none items-center justify-center rounded-full bg-white/15 text-[12px] font-semibold text-side-on">
                  {initials(user?.name)}
                </div>
                <div className="min-w-0 flex-1 leading-[1.2]">
                  <div className="truncate text-[13.5px] font-medium text-side-on">{user?.name ?? "Sessão ativa"}</div>
                  <div className="truncate text-[11.5px] text-side-fg-2">{user?.email ?? "Conta"}</div>
                </div>
                <ChevronDown className="size-3.5 flex-none text-side-fg-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-52">
              <DropdownMenuItem onClick={() => navigate("/household")}>
                <Users className="size-4" /> Household
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="size-4" /> Perfil e configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={logout}>
                <LogOut className="size-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col sm:overflow-hidden">
        <header className="flex flex-none items-center justify-between gap-3 border-b border-divider bg-surface px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-brand">
              <BrandMark className="size-3.5 text-brand-ink" />
            </div>
            <span className="text-[15px] font-semibold -tracking-[0.01em]">Volta ao Controle</span>
          </div>
          <div className="flex items-center gap-1">
            {/* No celular não existe barra lateral, e é justamente no celular
                que se fotografa o cupom — o scan precisa estar aqui. */}
            {ai.data?.enabled && (
              <button
                type="button"
                aria-label="Falar com a JulIA"
                onClick={() => setAssistenteAberto(true)}
                className="flex size-11 flex-none items-center justify-center rounded-[10px] text-brand transition-colors hover:bg-surface-2"
              >
                <Sparkles className="size-[18px]" />
              </button>
            )}
            {ai.data?.enabled && (
              <ScanButton
                onScanned={handleScanned}
                label=""
                className="size-11 justify-center rounded-[10px] border-transparent bg-transparent px-0 py-0 text-text-5 hover:bg-surface-2 hover:text-text"
              />
            )}
            <ThemeSegmented />
            <button type="button" onClick={logout} aria-label="Sair" className="flex size-11 flex-none items-center justify-center rounded-[10px] text-text-5 transition-colors hover:bg-surface-2 hover:text-text md:size-9">
              <LogOut className="size-[18px]" />
            </button>
          </div>
        </header>

        <main /* pb-24 no celular reserva o espaço do FAB: sem isso ele fica
             permanentemente por cima da última linha da lista. */
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-5 sm:px-1 sm:pb-6 sm:pt-1">
          <div key={location.pathname} className="mx-auto w-full max-w-[1500px] animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
            <Outlet />
          </div>
        </main>

        <nav className="flex flex-none items-center justify-around border-t border-divider bg-surface pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 sm:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-all active:scale-90",
                  isActive ? "text-brand" : "text-text-5",
                )
              }
            >
              <svg width="19" height="19" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                {item.icon}
              </svg>
              <span className="text-[11px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <AssistantSheet open={assistenteAberto} onOpenChange={setAssistenteAberto} />
    </div>
  );
}
