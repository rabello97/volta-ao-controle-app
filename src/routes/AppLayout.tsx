import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, Repeat, CreditCard, PieChart, LogOut, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { to: "/recurring-bills", label: "Recorrentes", icon: Repeat },
  { to: "/credit-cards", label: "Cartões", icon: CreditCard },
  { to: "/reports", label: "Relatórios", icon: PieChart },
];

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

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-divider bg-sidebar/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center gap-6 px-4 md:px-7">
          <div className="flex flex-none items-center gap-2">
            <div className="flex size-7.5 items-center justify-center rounded-[8px] bg-accent">
              <Gauge className="size-4 text-accent-ink" strokeWidth={2.25} />
            </div>
            <span className="hidden font-heading text-[14px] font-bold tracking-tight text-text sm:inline">
              Volta ao Controle
            </span>
          </div>

          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-text-muted transition-colors",
                    isActive ? "bg-accent-tint text-accent" : "hover:bg-surface hover:text-text",
                  )
                }
              >
                <item.icon className="size-4 flex-none" strokeWidth={2} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex flex-none items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex size-7 items-center justify-center rounded-full bg-accent-tint-2 font-mono text-[10.5px] font-bold text-accent">
                {initials(user?.name)}
              </div>
              <span className="max-w-[120px] truncate text-[13px] font-medium text-text">
                {user?.name ?? "Sessão ativa"}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Sair"
              className="flex size-8 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-negative-tint hover:text-negative"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] flex-1 p-4 pb-24 md:p-7 md:pb-7">
        <div key={location.pathname} className="animate-in fade-in duration-300">
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
                "flex flex-1 flex-col items-center gap-0.5 py-1.5 text-text-faint transition-colors",
                isActive && "text-accent",
              )
            }
          >
            <item.icon className="size-5" strokeWidth={2} />
            <span className="text-[10.5px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
