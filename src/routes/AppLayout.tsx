import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
    <div className="flex min-h-svh bg-background">
      <aside className="hidden w-[236px] flex-none flex-col gap-1 border-r border-divider bg-sidebar p-3.5 md:flex">
        <div className="flex items-center gap-2.5 px-2 pb-6 pt-2">
          <div className="flex size-8 flex-none items-center justify-center rounded-[9px] bg-accent">
            <Gauge className="size-4.5 text-accent-ink" strokeWidth={2.25} />
          </div>
          <span className="font-heading text-[15px] font-bold tracking-tight text-text">
            Volta ao Controle
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors",
                  isActive
                    ? "bg-accent-tint text-accent"
                    : "hover:bg-surface hover:text-text",
                )
              }
            >
              <item.icon className="size-4.5 flex-none" strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-2 flex items-center gap-2.5 border-t border-divider px-2 pt-3">
          <div className="flex size-8 flex-none items-center justify-center rounded-full bg-accent-tint-2 font-mono text-[11px] font-bold text-accent">
            {initials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-text">{user?.name ?? "Sessão ativa"}</div>
            <div className="text-[11px] text-text-faint">Conectado</div>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sair"
            className="flex size-7.5 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-negative-tint hover:text-negative"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-divider bg-sidebar px-4 py-3.5 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-6.5 flex-none items-center justify-center rounded-lg bg-accent">
              <Gauge className="size-3.5 text-accent-ink" strokeWidth={2.25} />
            </div>
            <span className="font-heading text-[14px] font-bold tracking-tight text-text">
              Volta ao Controle
            </span>
          </div>
          <button type="button" onClick={logout} aria-label="Sair" className="p-1 text-text-faint">
            <LogOut className="size-4.5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-7 md:pb-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto w-full max-w-[1080px]"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="fixed inset-x-0 bottom-0 flex items-center justify-around border-t border-divider bg-sidebar py-1.5 md:hidden">
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
    </div>
  );
}
