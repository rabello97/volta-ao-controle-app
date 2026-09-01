import { useQuery } from "@tanstack/react-query";
import { getUpcomingDue } from "@/api/dashboard";

export function useUpcomingDue(scope?: string, month?: string) {
  const query = useQuery({
    queryKey: ["upcoming-due", scope ?? "self", month ?? "atual"],
    queryFn: () => getUpcomingDue(scope, month),
  });
  return { items: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}
