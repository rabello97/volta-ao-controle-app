import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, Lock, WifiOff } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

type ErrorKind = "not-found" | "forbidden" | "offline";

const CONTENT: Record<ErrorKind, { icon: typeof Compass; title: string; description: string }> = {
  "not-found": {
    icon: Compass,
    title: "Essa tela não existe",
    description:
      "O endereço que você abriu não corresponde a nenhuma tela do app. Pode ser um link antigo ou um erro de digitação.",
  },
  forbidden: {
    icon: Lock,
    title: "Você não tem acesso a isso",
    description:
      "Este item pertence a outra conta. Se era algo do seu parceiro(a), use o seletor de visão no painel em vez de abrir direto.",
  },
  offline: {
    icon: WifiOff,
    title: "Sem conexão",
    description:
      "Não foi possível falar com o servidor. Os últimos dados carregados continuam disponíveis nas outras telas.",
  },
};

export function ErrorPage({ kind = "not-found" }: { kind?: ErrorKind }) {
  const navigate = useNavigate();
  const { icon: Icon, title, description } = CONTENT[kind];

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex items-center gap-2.5">
        <div className="flex size-[30px] items-center justify-center rounded-[10px] bg-brand">
          <BrandMark className="size-[18px] text-brand-ink" />
        </div>
        <span className="text-[15px] font-semibold -tracking-[0.01em] text-text">Volta ao Controle</span>
      </div>

      <div className="flex w-full max-w-[380px] flex-col items-center gap-3 rounded-[18px] border border-divider bg-surface px-6 py-8 shadow-[var(--shadow-card)]">
        <div className="flex size-[46px] items-center justify-center rounded-[14px] bg-brand-tint text-brand">
          <Icon className="size-5" />
        </div>
        <h1 className="text-[19px] font-semibold text-text">{title}</h1>
        <p className="text-[13px] leading-[1.5] text-text-3">{description}</p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-[10px] border border-divider px-3.5 py-2 text-[13px] text-text-2 transition-all hover:border-divider-strong active:scale-95"
          >
            <ArrowLeft className="size-3.5" /> Voltar
          </button>
          <Link
            to="/dashboard"
            className="rounded-[10px] bg-brand px-3.5 py-2 text-[13px] font-semibold text-brand-ink transition-all hover:bg-brand-hover active:scale-95"
          >
            Ir para o painel
          </Link>
        </div>
      </div>
    </div>
  );
}
