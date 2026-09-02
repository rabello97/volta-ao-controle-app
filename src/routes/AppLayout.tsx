import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { LogOut, Users, Settings, ChevronDown, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { BrandMark } from "@/components/BrandMark";
import { formatCurrency } from "@/lib/format";
import { useTransactions } from "@/hooks/useTransactions";
import { useRecurringBills } from "@/hooks/useRecurringBills";
import { useCreditCards } from "@/hooks/useCreditCards";
import { scopeFor } from "@/lib/scope";
import { useHouseholdView } from "@/context/HouseholdViewContext";
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
    icon: <path d="M2 5h10l-2.5-2.5M14 11H4l2.5 2.5" />,
  },
  {
    to: "/recurring-bills",
    label: "Recorrentes",
    icon: (
      <>
        <path d="M2.6 8a5.4 5.4 0 0 1 9.2-3.8M13.4 8a5.4 5.4 0 0 1-9.2 3.8" />
        <path d="M11.4 1.9v2.5h-2.5M4.6 14.1v-2.5h2.5" />
      </>
    ),
  },
  {
    to: "/casa",
    label: "Casa",
    icon: (
      <>
        <path d="M2 3h1.9l1.7 7.6h6.9l1.6-5.3H4.4" />
        <circle cx="6.6" cy="13" r="1" />
        <circle cx="11.8" cy="13" r="1" />
      </>
    ),
  },
  {
    to: "/credit-cards",
    label: "Cartões",
    icon: (
      <>
        <rect x="1.5" y="3.5" width="13" height="9" rx="2" />
        <path d="M1.5 6.8h13" />
      </>
    ),
  },
  {
    to: "/reports",
    label: "Relatórios",
    icon: (
      <>
        <circle cx="8" cy="8" r="6.2" />
        <path d="M8 1.8V8h6.2" />
      </>
    ),
  },
];

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-none">
      {children}
    </svg>
  );
}

function SavingsGoalCard({ saved, target }: { saved: number; target: number }) {
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  return (
    <div className="flex flex-col gap-[9px] rounded-[14px] border border-divider bg-surface p-3.5 shadow-[var(--shadow-card)]">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-text-3">Meta de reserva</span>
        <span className="font-mono text-[12px] text-brand">{pct}%</span>
      </div>
      <div className="h-[5px] overflow-hidden rounded-[4px] bg-track">
        <div className="h-full rounded-[4px] bg-[image:var(--meter-grad)]" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-text-5">
        {formatCurrency(saved)} de {formatCurrency(target)}
      </span>
    </div>
  );
}

function ThemeSegmented() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Antes de montar não sabemos o tema resolvido; um placeholder do mesmo
  // tamanho evita o "pulo" de layout e o mismatch de hidratação.
  if (!mounted) return <div className="h-[26px] w-[58px]" aria-hidden="true" />;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex gap-0.5 rounded-full bg-surface-2 p-[3px]">
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
              active ? "bg-track text-text" : "text-text-5 hover:text-text",
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

  const counts: Record<string, number | undefined> = {
    "/transactions": transactions.data?.total,
    "/recurring-bills": bills.data?.length,
  };
  const cardsAlert = (cards.data ?? []).some((c) => (c.utilizationPct ?? 0) >= 70);

  // A casca é fixa nas quatro bordas em vez de ter altura 100dvh: no PWA em tela
  // cheia do iOS o dvh vem menor que a tela e sobrava uma faixa preta embaixo da
  // barra de navegação. Com inset-0 ela sempre cobre a viewport inteira.
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background text-text sm:grid sm:grid-cols-[252px_1fr]">
      <aside className="hidden h-full flex-col gap-6 overflow-y-auto border-r border-divider px-4 py-[22px] sm:flex">
        <div className="flex items-center gap-[11px] px-2">
          <div className="flex size-[30px] flex-none items-center justify-center rounded-[10px] bg-brand">
            <BrandMark className="size-[18px] text-brand-ink" />
          </div>
          <div className="flex flex-col leading-[1.15]">
            <span className="whitespace-nowrap text-[15px] font-semibold -tracking-[0.01em]">Volta ao Controle</span>
            <span className="text-[11px] text-text-5">Finanças pessoais</span>
          </div>
        </div>

        <nav className="flex flex-col gap-[3px]">
          <span className="px-[10px] pb-2 text-[11px] font-semibold tracking-[0.12em] text-text-5">GERAL</span>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-[11px] rounded-[10px] px-[10px] py-[9px] text-[13px] transition-colors",
                  isActive
                    ? "bg-nav-active-bg font-semibold text-nav-active-fg"
                    : "text-nav-idle-fg hover:text-text",
                )
              }
            >
              <NavIcon>{item.icon}</NavIcon>
              {item.label}
              {counts[item.to] !== undefined && (
                <span className="ml-auto font-mono text-[11px] text-text-5">{counts[item.to]}</span>
              )}
              {item.to === "/credit-cards" && cardsAlert && (
                <span className="ml-auto size-1.5 rounded-full bg-negative" />
              )}
            </NavLink>
          ))}
        </nav>

        {user && (
          <SavingsGoalCard saved={user.savingsGoalSaved ?? 0} target={user.savingsGoalTarget ?? 0} />
        )}

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between px-[10px] py-1.5">
            <span className="text-[11px] font-semibold tracking-[0.12em] text-text-5">TEMA</span>
            <ThemeSegmented />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-[10px] border border-divider bg-surface px-[10px] py-2.5 transition-colors hover:border-divider-strong"
              >
                <div className="flex size-7 flex-none items-center justify-center rounded-full bg-brand-tint text-[11px] font-semibold text-brand">
                  {initials(user?.name)}
                </div>
                <div className="min-w-0 flex-1 text-left leading-[1.2]">
                  <div className="truncate text-[13px] font-medium text-text">{user?.name ?? "Sessão ativa"}</div>
                  <div className="text-[11px] text-text-5">Conta</div>
                </div>
                <ChevronDown className="size-3.5 flex-none text-text-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-48">
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex flex-none items-center justify-between gap-3 border-b border-divider bg-surface px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-brand">
              <BrandMark className="size-3.5 text-brand-ink" />
            </div>
            <span className="text-[15px] font-semibold -tracking-[0.01em]">Volta ao Controle</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeSegmented />
            <button type="button" onClick={logout} aria-label="Sair" className="flex size-11 flex-none items-center justify-center rounded-[10px] transition-colors md:size-9 text-text-5 hover:bg-surface-2 hover:text-text">
              <LogOut className="size-[18px]" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-5 sm:px-[34px] sm:pb-[54px] sm:pt-[26px]">
          <div key={location.pathname} className="mx-auto w-full max-w-[1780px] animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
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
    </div>
  );
}
