import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  useEffect(() => {
    if (user) profileForm.reset({ name: user.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name]);

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
      <h1 className="font-heading text-[22px] font-bold tracking-tight text-text">Perfil e configurações</h1>

      <div className="rounded-2xl border border-divider/70 bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <User className="size-4 text-text-faint" />
          <h2 className="font-heading text-[15px] font-bold text-text">Seu perfil</h2>
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

      <div className="rounded-2xl border border-divider/70 bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="size-4 text-text-faint" />
          <h2 className="font-heading text-[15px] font-bold text-text">Senha</h2>
        </div>
        <p className="mb-4 text-[13px] text-text-muted">
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
