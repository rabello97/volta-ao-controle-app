import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Repeat,
  CreditCard,
  PieChart,
  LogOut,
  Users,
  Settings,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { BrandMark } from "@/components/BrandMark";
import { MoneyValue } from "@/components/MoneyValue";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { to: "/recurring-bills", label: "Recorrentes", icon: Repeat },
  { to: "/credit-cards", label: "Cartões", icon: CreditCard },
  { to: "/reports", label: "Relatórios", icon: PieChart },
];

function SavingsGoalWidget({ user }: { user: { savingsGoalTarget: number | null; savingsGoalSaved: number | null } }) {
  const target = user.savingsGoalTarget ?? 0;
  const saved = user.savingsGoalSaved ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg px-2 py-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-text-4">
        <span>Meta de reserva</span>
        <span className="font-mono text-text-3">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-track">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[11px] text-text-4">
        <MoneyValue value={saved} className="text-[11px]" /> de <MoneyValue value={target} className="text-[11px]" />
      </div>
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

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="hidden w-[224px] flex-none flex-col gap-1 border-r border-divider bg-sidebar p-3.5 md:flex">
        <div className="flex items-center gap-2.5 px-2 pb-6 pt-2">
          <div className="flex size-8 flex-none items-center justify-center rounded-[9px] bg-brand">
            <BrandMark className="size-4.5 text-brand-ink" />
          </div>
          <span className="font-heading text-[15px] font-bold tracking-tight text-text">Volta ao Controle</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-text-3 transition-colors",
                  isActive ? "bg-track font-semibold text-text" : "hover:bg-surface-2 hover:text-text",
                )
              }
            >
              <item.icon className="size-4.5 flex-none" strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {user?.savingsGoalTarget ? <SavingsGoalWidget user={user} /> : null}

        <div className="flex flex-col gap-2 border-t border-divider pt-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-text-4">Tema</span>
            <ThemeToggle />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2"
              >
                <div className="flex size-8 flex-none items-center justify-center rounded-full bg-brand-tint-2 text-[11px] font-bold text-brand">
                  {initials(user?.name)}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-[13px] font-semibold text-text">{user?.name ?? "Sessão ativa"}</div>
                  <div className="text-[11px] text-text-4">Conta</div>
                </div>
                <ChevronDown className="size-3.5 flex-none text-text-4" />
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-divider bg-sidebar px-4 py-3.5 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-6.5 flex-none items-center justify-center rounded-lg bg-brand">
              <BrandMark className="size-3.5 text-brand-ink" />
            </div>
            <span className="font-heading text-[14px] font-bold tracking-tight text-text">Volta ao Controle</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button type="button" onClick={logout} aria-label="Sair" className="p-1 text-text-4">
              <LogOut className="size-4.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-7 md:pb-7">
          <div key={location.pathname} className="mx-auto w-full max-w-[1780px] animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-divider bg-sidebar py-1.5 md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-1.5 text-text-4 transition-colors",
                  isActive && "text-brand",
                )
              }
            >
              <item.icon className="size-5" strokeWidth={2} />
              <span className="text-[10.5px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
