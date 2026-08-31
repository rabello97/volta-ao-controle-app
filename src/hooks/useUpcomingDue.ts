import { useQuery } from "@tanstack/react-query";
import { getUpcomingDue } from "@/api/dashboard";

export function useUpcomingDue(scope?: string) {
  const query = useQuery({ queryKey: ["upcoming-due", scope ?? "self"], queryFn: () => getUpcomingDue(scope) });
  return { items: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}
