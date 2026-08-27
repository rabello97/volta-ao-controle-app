import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "next-themes";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "@/context/AuthContext";
import { login as loginRequest, loginWithGoogle as loginWithGoogleRequest } from "@/api/auth";
import { ApiError } from "@/api/client";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function ThemeToggleFloating() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-8 w-[68px]" aria-hidden="true" />;
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex gap-0.5 rounded-full border border-divider bg-surface p-[3px]">
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
              "flex size-7 items-center justify-center rounded-full transition-colors",
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

export function LoginPage() {
  const { status, login } = useAuth();
  const { resolvedTheme } = useTheme();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      login(await loginRequest(values));
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onGoogleSuccess(idToken: string) {
    setServerError(null);
    try {
      login(await loginWithGoogleRequest({ idToken }));
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Não foi possível entrar com Google.");
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex justify-end p-4 sm:p-6">
        <ThemeToggleFloating />
      </div>

      <div className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center sm:pb-24">
        <div className="flex w-full max-w-[380px] flex-col gap-7 rounded-[18px] border border-hero-border bg-[image:var(--hero-grad)] p-7 sm:p-8">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex size-[42px] items-center justify-center rounded-[13px] bg-brand">
              <BrandMark className="size-6 text-brand-ink" />
            </div>
            <h1 className="text-[19px] font-semibold -tracking-[0.01em] text-text">Volta ao Controle</h1>
            <p className="text-[12.5px] text-text-4">Finanças do casal, sem perder o rumo.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[12px] font-medium text-text-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="rounded-[10px] border border-divider bg-surface px-3 py-2.5 text-[13.5px] text-text outline-none transition-colors placeholder:text-text-5 focus:border-brand"
              />
              {errors.email && <span className="text-[11.5px] text-negative">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[12px] font-medium text-text-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="rounded-[10px] border border-divider bg-surface px-3 py-2.5 text-[13.5px] text-text outline-none transition-colors placeholder:text-text-5 focus:border-brand"
              />
              {errors.password && <span className="text-[11.5px] text-negative">{errors.password.message}</span>}
            </div>

            {serverError && (
              <p className="rounded-[10px] bg-negative-tint px-3 py-2 text-[12.5px] text-negative">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 rounded-[10px] bg-brand py-2.5 text-[13px] font-semibold text-brand-ink transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {isSubmitting ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <div className="flex items-center gap-3 text-[11.5px] text-text-5">
            <span className="h-px flex-1 bg-divider" />
            ou
            <span className="h-px flex-1 bg-divider" />
          </div>

          <div className="flex justify-center [color-scheme:light]">
            <GoogleLogin
              // O widget do Google é um iframe próprio: só respeita o tema via
              // esta prop, e o container acima fixa color-scheme para o popup
              // não herdar o esquema escuro da página e ficar ilegível.
              key={resolvedTheme}
              theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
              shape="pill"
              width="316"
              text="continue_with"
              onSuccess={(res) => {
                if (res.credential) void onGoogleSuccess(res.credential);
              }}
              onError={() => setServerError("Não foi possível entrar com Google.")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
