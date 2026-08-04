import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dataroomStorage } from "@/lib/storage";

const DATAROOMS_KEY = ["datarooms"] as const;

export function useDatarooms() {
  return useQuery({
    queryKey: DATAROOMS_KEY,
    queryFn: () => dataroomStorage.listDatarooms(),
  });
}

export function useCreateDataroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => dataroomStorage.createDataroom(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATAROOMS_KEY });
    },
  });
}

export function useDeleteDataroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataroomStorage.deleteDataroom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DATAROOMS_KEY });
    },
  });
}
