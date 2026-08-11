import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function RequireAuth() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center text-text-muted">
        Carregando…
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
