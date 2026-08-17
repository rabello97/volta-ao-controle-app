import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Repeat,
  CreditCard,
  PieChart,
  LogOut,
  Compass,
  Users,
  Settings,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
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
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-divider bg-sidebar/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center gap-6 px-4 md:px-7">
          <div className="flex flex-none items-center gap-2">
            <div className="flex size-7.5 items-center justify-center rounded-[8px] bg-accent">
              <Compass className="size-4 text-accent-ink" strokeWidth={2.25} />
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

          <div className="ml-auto flex flex-none items-center gap-1.5">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2 transition-colors hover:bg-surface"
                >
                  <div className="flex size-7 flex-none items-center justify-center rounded-full bg-accent-tint-2 text-[11px] font-bold text-accent">
                    {initials(user?.name)}
                  </div>
                  <span className="hidden max-w-[120px] truncate text-[13px] font-medium text-text sm:inline">
                    {user?.name ?? "Sessão ativa"}
                  </span>
                  <ChevronDown className="hidden size-3.5 text-text-faint sm:inline" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
