import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptInvite, declineInvite, getHousehold, inviteToHousehold, listInvites } from "@/api/household";

export function useHousehold() {
  return useQuery({ queryKey: ["household"], queryFn: getHousehold });
}

export function useInvites() {
  return useQuery({ queryKey: ["household-invites"], queryFn: listInvites });
}

function useInvalidateHousehold() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["household"] });
    queryClient.invalidateQueries({ queryKey: ["household-invites"] });
  };
}

export function useInviteToHousehold() {
  const invalidate = useInvalidateHousehold();
  return useMutation({
    mutationFn: (toEmail: string) => inviteToHousehold(toEmail),
    onSuccess: invalidate,
  });
}

export function useAcceptInvite() {
  const invalidate = useInvalidateHousehold();
  return useMutation({
    mutationFn: (inviteId: string) => acceptInvite(inviteId),
    onSuccess: invalidate,
  });
}

export function useDeclineInvite() {
  const invalidate = useInvalidateHousehold();
  return useMutation({
    mutationFn: (inviteId: string) => declineInvite(inviteId),
    onSuccess: invalidate,
  });
}
