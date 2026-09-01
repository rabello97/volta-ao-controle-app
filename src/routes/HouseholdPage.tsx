import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Check, X, Send, Unlink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAcceptInvite,
  useDeclineInvite,
  useHousehold,
  useInvites,
  useInviteToHousehold,
  useLeaveHousehold,
} from "@/hooks/useHousehold";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/api/client";
import { formatDate } from "@/lib/format";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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
  const [confirmLeave, setConfirmLeave] = useState(false);
  const leaveMutation = useLeaveHousehold();

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

  async function handleLeave() {
    try {
      await leaveMutation.mutateAsync();
      setConfirmLeave(false);
      toast.success("Vínculo desfeito.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível desfazer o vínculo.");
    }
  }

  const pendingReceived = invites.data?.received.filter((i) => i.status === "PENDING") ?? [];
  const pendingSent = invites.data?.sent.filter((i) => i.status === "PENDING") ?? [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Household" subtitle="Compartilhe as finanças com seu parceiro(a)" />

      {hasHousehold && partner && (
        <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-3 text-[14.5px] font-semibold text-text">Vocês formam um household</h2>
          <div className="flex items-center gap-3 rounded-lg border border-divider bg-surface-2 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-brand-tint-2 text-sm font-semibold text-brand">
              {partner.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-text">{partner.name}</div>
              <div className="text-xs text-text-3">{partner.email}</div>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-text-3">
            No painel e nos relatórios você pode alternar entre "Só eu", "Só {partner.name.split(" ")[0]}" e
            "Casal (somado)". Os lançamentos continuam separados — cada um é dono dos seus.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-divider pt-4">
            <Button size="sm" variant="secondary" onClick={() => setConfirmLeave(true)}>
              <Unlink className="size-3.5" /> Desfazer vínculo
            </Button>
            <span className="text-[12px] text-text-4">
              Qualquer um dos dois pode desfazer. Nenhuma transação é apagada.
            </span>
          </div>
        </div>
      )}

      {!hasHousehold && pendingReceived.length > 0 && (
        <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-3 text-[14.5px] font-semibold text-text">Convites recebidos</h2>
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
                  <div className="min-w-0">
                    {/* Antes dizia só "Convite pendente": quem recebia não
                        fazia ideia de quem tinha convidado. */}
                    <div className="truncate text-sm font-medium text-text">
                      {invite.fromUserName} quer juntar as contas com você
                    </div>
                    <div className="truncate text-xs text-text-3">
                      {invite.fromUserEmail && `${invite.fromUserEmail} · `}
                      recebido em {formatDate(invite.createdAt)}
                    </div>
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
        <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-3 text-[14.5px] font-semibold text-text">Convidar parceiro(a)</h2>
          <p className="mb-3 text-[13px] text-text-3">
            O e-mail serve para localizar a conta — ela precisa já ter se cadastrado no app com esse endereço.
          </p>
          <p className="mb-4 flex items-start gap-2 rounded-xl bg-warning-tint px-3.5 py-2.5 text-[12.5px] text-warning">
            <Info className="mt-px size-3.5 flex-none" />
            <span>
              Não enviamos e-mail. Avise você mesmo — o convite aparece para ela aqui nesta tela, em
              "Convites recebidos", assim que ela entrar no app.
            </span>
          </p>
          <form onSubmit={handleSubmit(onInvite)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="toEmail">E-mail do parceiro(a)</Label>
              <Input id="toEmail" type="email" placeholder="email-da-conta-dela@exemplo.com" {...register("toEmail")} />
              {errors.toEmail && <span className="text-xs text-negative">{errors.toEmail.message}</span>}
            </div>
            <Button type="submit" disabled={inviteMutation.isPending}>
              <Send className="size-4" /> {inviteMutation.isPending ? "Convidando…" : "Convidar"}
            </Button>
          </form>

          {pendingSent.length > 0 && (
            <div className="mt-5 flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-text-4">
                Convites aguardando ela aceitar no app
              </span>
              {pendingSent.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border border-divider bg-surface-2 px-4 py-2.5 text-sm"
                >
                  <span className="text-text">{invite.toEmail}</span>
                  <span className="text-xs text-text-4">{formatDate(invite.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Desfazer vínculo do casal"
        description="Vocês voltam a ver apenas os próprios números e cada um fica livre para vincular outra pessoa. Nenhuma transação é apagada."
        confirmLabel={leaveMutation.isPending ? "Desfazendo…" : "Desfazer vínculo"}
        onConfirm={handleLeave}
      />
    </div>
  );
}
