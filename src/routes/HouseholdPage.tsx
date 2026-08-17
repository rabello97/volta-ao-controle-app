import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Check, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAcceptInvite,
  useDeclineInvite,
  useHousehold,
  useInvites,
  useInviteToHousehold,
} from "@/hooks/useHousehold";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/api/client";
import { formatDate } from "@/lib/format";

const inviteSchema = z.object({ toEmail: z.string().email("Informe um e-mail válido") });
type InviteFormValues = z.infer<typeof inviteSchema>;

export function HouseholdPage() {
  const { user } = useAuth();
  const household = useHousehold();
  const invites = useInvites();
  const inviteMutation = useInviteToHousehold();
  const acceptMutation = useAcceptInvite();
  const declineMutation = useDeclineInvite();
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({ resolver: zodResolver(inviteSchema) });

  const hasHousehold = (household.data?.members.length ?? 0) >= 2;
  const partner = household.data?.members.find((m) => m.id !== user?.id);

  async function onInvite(values: InviteFormValues) {
    try {
      await inviteMutation.mutateAsync(values.toEmail);
      toast.success("Convite enviado.");
      reset();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível enviar o convite.");
    }
  }

  async function handleAccept(inviteId: string) {
    setRespondingId(inviteId);
    try {
      await acceptMutation.mutateAsync(inviteId);
      toast.success("Convite aceito! Vocês agora formam um household.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível aceitar o convite.");
    } finally {
      setRespondingId(null);
    }
  }

  async function handleDecline(inviteId: string) {
    setRespondingId(inviteId);
    try {
      await declineMutation.mutateAsync(inviteId);
      toast.success("Convite recusado.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível recusar o convite.");
    } finally {
      setRespondingId(null);
    }
  }

  const pendingReceived = invites.data?.received.filter((i) => i.status === "PENDING") ?? [];
  const pendingSent = invites.data?.sent.filter((i) => i.status === "PENDING") ?? [];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-[22px] font-bold tracking-tight text-text">Household</h1>

      {hasHousehold && partner && (
        <div className="rounded-2xl border border-divider/70 bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-heading text-[15px] font-bold text-text">Vocês formam um household</h2>
          <div className="flex items-center gap-3 rounded-lg border border-divider bg-surface-2 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-brand-tint-2 text-sm font-bold text-brand">
              {partner.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-text">{partner.name}</div>
              <div className="text-xs text-text-muted">{partner.email}</div>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-text-muted">
            Vocês já podem ver a visão unificada e a visão individual um do outro no painel e nos relatórios.
          </p>
        </div>
      )}

      {!hasHousehold && pendingReceived.length > 0 && (
        <div className="rounded-2xl border border-divider/70 bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-heading text-[15px] font-bold text-text">Convites recebidos</h2>
          <ul className="flex flex-col gap-2.5">
            {pendingReceived.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-divider bg-surface-2 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-brand-tint text-brand">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text">Convite pendente</div>
                    <div className="text-xs text-text-muted">Recebido em {formatDate(invite.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={respondingId === invite.id}
                    onClick={() => handleDecline(invite.id)}
                  >
                    <X className="size-3.5" /> Recusar
                  </Button>
                  <Button size="sm" disabled={respondingId === invite.id} onClick={() => handleAccept(invite.id)}>
                    <Check className="size-3.5" /> Aceitar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasHousehold && (
        <div className="rounded-2xl border border-divider/70 bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-heading text-[15px] font-bold text-text">Convidar parceiro(a)</h2>
          <p className="mb-4 text-[13px] text-text-muted">
            Convide alguém já cadastrado pelo e-mail para formar um household e compartilhar a visão das finanças.
          </p>
          <form onSubmit={handleSubmit(onInvite)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="toEmail">E-mail do parceiro(a)</Label>
              <Input id="toEmail" type="email" placeholder="nome@example.com" {...register("toEmail")} />
              {errors.toEmail && <span className="text-xs text-negative">{errors.toEmail.message}</span>}
            </div>
            <Button type="submit" disabled={inviteMutation.isPending}>
              <Send className="size-4" /> {inviteMutation.isPending ? "Enviando…" : "Enviar convite"}
            </Button>
          </form>

          {pendingSent.length > 0 && (
            <div className="mt-5 flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                Convites enviados, aguardando resposta
              </span>
              {pendingSent.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border border-divider bg-surface-2 px-4 py-2.5 text-sm"
                >
                  <span className="text-text">{invite.toEmail}</span>
                  <span className="text-xs text-text-faint">{formatDate(invite.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
