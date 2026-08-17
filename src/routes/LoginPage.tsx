import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { login as loginRequest, loginWithGoogle as loginWithGoogleRequest } from "@/api/auth";
import { ApiError } from "@/api/client";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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
      const result = await loginRequest(values);
      login(result);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onGoogleSuccess(idToken: string) {
    setServerError(null);
    try {
      const result = await loginWithGoogleRequest({ idToken });
      login(result);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Não foi possível entrar com Google.");
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/[0.07] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative flex w-full max-w-[400px] flex-col gap-7 rounded-2xl border border-divider bg-surface p-8"
      >
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl border border-brand/25 bg-brand-tint">
            <Compass className="size-6 text-brand" strokeWidth={2.25} />
          </div>
          <h1 className="font-heading text-xl font-bold tracking-tight text-text">Volta ao Controle</h1>
          <p className="text-[13px] text-text-muted">Finanças do casal, sem perder o rumo.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <span className="text-xs text-negative">{errors.email.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <span className="text-xs text-negative">{errors.password.message}</span>}
          </div>

          {serverError && <p className="text-sm text-negative">{serverError}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-1 font-heading font-semibold">
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-text-faint">
          <span className="h-px flex-1 bg-divider" />
          ou
          <span className="h-px flex-1 bg-divider" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                void onGoogleSuccess(credentialResponse.credential);
              }
            }}
            onError={() => setServerError("Não foi possível entrar com Google.")}
            text="continue_with"
            theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
          />
        </div>
      </motion.div>
    </div>
  );
}
