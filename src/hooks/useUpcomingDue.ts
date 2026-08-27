import { useQuery } from "@tanstack/react-query";
import { getUpcomingDue } from "@/api/dashboard";

export function useUpcomingDue() {
  const query = useQuery({ queryKey: ["upcoming-due"], queryFn: getUpcomingDue });
  return { items: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}
