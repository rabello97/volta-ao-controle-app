import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, KeyRound, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetSettings } from "@/components/BudgetSettings";
import { WalletSettings } from "@/components/WalletSettings";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { updateProfile as updateProfileRequest, changePassword as changePasswordRequest } from "@/api/auth";
import { ApiError } from "@/api/client";

const profileSchema = z.object({ name: z.string().min(1, "Informe o nome") });
type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

const goalSchema = z.object({
  savingsGoalTarget: z.coerce.number().min(0, "Informe um valor positivo").optional().or(z.literal("").transform(() => undefined)),
  savingsGoalSaved: z.coerce.number().min(0, "Informe um valor positivo").optional().or(z.literal("").transform(() => undefined)),
});
type GoalFormInput = z.input<typeof goalSchema>;
type GoalFormValues = z.output<typeof goalSchema>;

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const goalForm = useForm<GoalFormInput, unknown, GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: { savingsGoalTarget: user?.savingsGoalTarget ?? undefined, savingsGoalSaved: user?.savingsGoalSaved ?? undefined },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name });
      goalForm.reset({
        savingsGoalTarget: user.savingsGoalTarget ?? undefined,
        savingsGoalSaved: user.savingsGoalSaved ?? undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, user?.savingsGoalTarget, user?.savingsGoalSaved]);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSaveProfile(values: ProfileFormValues) {
    setIsSavingProfile(true);
    try {
      const updated = await updateProfileRequest(values);
      updateUser(updated);
      toast.success("Perfil atualizado.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar o perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function onSaveGoal(values: GoalFormValues) {
    setIsSavingGoal(true);
    try {
      const updated = await updateProfileRequest({
        savingsGoalTarget: values.savingsGoalTarget ?? null,
        savingsGoalSaved: values.savingsGoalSaved ?? null,
      });
      updateUser(updated);
      toast.success("Meta de reserva atualizada.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar a meta.");
    } finally {
      setIsSavingGoal(false);
    }
  }

  async function onSavePassword(values: PasswordFormValues) {
    setIsSavingPassword(true);
    try {
      await changePasswordRequest({
        currentPassword: values.currentPassword || undefined,
        newPassword: values.newPassword,
      });
      toast.success("Senha atualizada.");
      passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível trocar a senha.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Perfil e configurações" subtitle="Sua conta e preferências" />

      <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center gap-2">
          <User className="size-4 text-text-4" />
          <h2 className="text-[15px] font-semibold text-text">Seu perfil</h2>
        </div>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="flex flex-col gap-3.5 sm:max-w-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...profileForm.register("name")} />
            {profileForm.formState.errors.name && (
              <span className="text-xs text-negative">{profileForm.formState.errors.name.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>E-mail</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <Button type="submit" disabled={isSavingProfile} className="w-fit">
            {isSavingProfile ? "Salvando…" : "Salvar perfil"}
          </Button>
        </form>
      </div>

      <WalletSettings />

      <BudgetSettings />

      <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center gap-2">
          <Target className="size-4 text-text-4" />
          <h2 className="text-[15px] font-semibold text-text">Meta de reserva</h2>
        </div>
        <p className="mb-4 text-[13px] text-text-3">
          Aparece como barra de progresso na sidebar. Atualizado manualmente — não tem vínculo com transações.
        </p>
        <form onSubmit={goalForm.handleSubmit(onSaveGoal)} className="flex flex-col gap-3.5 sm:max-w-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="savingsGoalSaved">Valor guardado</Label>
              <Input id="savingsGoalSaved" type="text" inputMode="decimal" step="0.01" {...goalForm.register("savingsGoalSaved")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="savingsGoalTarget">Meta</Label>
              <Input id="savingsGoalTarget" type="text" inputMode="decimal" step="0.01" {...goalForm.register("savingsGoalTarget")} />
            </div>
          </div>
          <Button type="submit" disabled={isSavingGoal} className="w-fit">
            {isSavingGoal ? "Salvando…" : "Salvar meta"}
          </Button>
        </form>
      </div>

      <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="size-4 text-text-4" />
          <h2 className="text-[15px] font-semibold text-text">Senha</h2>
        </div>
        <p className="mb-4 text-[13px] text-text-3">
          Se sua conta foi criada com Google e ainda não tem senha, deixe "Senha atual" em branco para definir a
          primeira.
        </p>
        <form onSubmit={passwordForm.handleSubmit(onSavePassword)} className="flex flex-col gap-3.5 sm:max-w-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Senha atual (se já tiver uma)</Label>
            <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
            {passwordForm.formState.errors.newPassword && (
              <span className="text-xs text-negative">{passwordForm.formState.errors.newPassword.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
            {passwordForm.formState.errors.confirmPassword && (
              <span className="text-xs text-negative">{passwordForm.formState.errors.confirmPassword.message}</span>
            )}
          </div>
          <Button type="submit" disabled={isSavingPassword} className="w-fit">
            {isSavingPassword ? "Salvando…" : "Trocar senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
