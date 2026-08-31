import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeHouseTask,
  createHouseTask,
  deleteHouseTask,
  listHouseTasks,
  updateHouseTask,
  type HouseTaskInput,
} from "@/api/houseTasks";

function useInvalidateHouseTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["house-tasks"] });
}

export function useHouseTasks(scope?: string) {
  return useQuery({ queryKey: ["house-tasks", scope ?? "self"], queryFn: () => listHouseTasks(scope) });
}

export function useCreateHouseTask() {
  const invalidate = useInvalidateHouseTasks();
  return useMutation({ mutationFn: (input: HouseTaskInput) => createHouseTask(input), onSuccess: invalidate });
}

export function useUpdateHouseTask() {
  const invalidate = useInvalidateHouseTasks();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<HouseTaskInput> }) => updateHouseTask(id, input),
    onSuccess: invalidate,
  });
}

export function useCompleteHouseTask() {
  const invalidate = useInvalidateHouseTasks();
  return useMutation({ mutationFn: (id: string) => completeHouseTask(id), onSuccess: invalidate });
}

export function useDeleteHouseTask() {
  const invalidate = useInvalidateHouseTasks();
  return useMutation({ mutationFn: (id: string) => deleteHouseTask(id), onSuccess: invalidate });
}
