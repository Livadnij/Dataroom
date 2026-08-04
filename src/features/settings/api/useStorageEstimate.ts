import { useQuery } from "@tanstack/react-query";
import { getStorageEstimate } from "@/lib/storage/estimate";

export function useStorageEstimate() {
  return useQuery({
    queryKey: ["storage-estimate"],
    queryFn: getStorageEstimate,
    refetchInterval: 5000,
  });
}
