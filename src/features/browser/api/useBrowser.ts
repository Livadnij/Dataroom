import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dataroomStorage } from "@/lib/storage";
import type { BrowserItem } from "@/types/entities";

function contentsKey(dataroomId: string, folderId: string | null) {
  return ["contents", dataroomId, folderId ?? "root"] as const;
}

function breadcrumbsKey(dataroomId: string, folderId: string | null) {
  return ["breadcrumbs", dataroomId, folderId ?? "root"] as const;
}

function invalidateDataroom(
  queryClient: ReturnType<typeof useQueryClient>,
  dataroomId: string,
) {
  queryClient.invalidateQueries({ queryKey: ["contents", dataroomId] });
  queryClient.invalidateQueries({ queryKey: ["breadcrumbs", dataroomId] });
}

export function useFolderContents(dataroomId: string, folderId: string | null) {
  return useQuery({
    queryKey: contentsKey(dataroomId, folderId),
    queryFn: () => dataroomStorage.listContents(dataroomId, folderId),
  });
}

export function useBreadcrumbs(dataroomId: string, folderId: string | null) {
  return useQuery({
    queryKey: breadcrumbsKey(dataroomId, folderId),
    queryFn: () => dataroomStorage.getBreadcrumbs(dataroomId, folderId),
  });
}

export function useCreateFolder(dataroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      parentId,
      name,
    }: {
      parentId: string | null;
      name: string;
    }) => dataroomStorage.createFolder(dataroomId, parentId, name),
    onSuccess: () => invalidateDataroom(queryClient, dataroomId),
  });
}

export function useRenameFolder(dataroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      dataroomStorage.renameFolder(id, name),
    onSuccess: () => invalidateDataroom(queryClient, dataroomId),
  });
}

export function useFolderDeletionPreview(folderId: string | null) {
  return useQuery({
    queryKey: ["folder-deletion-preview", folderId],
    queryFn: () => dataroomStorage.previewFolderDeletion(folderId as string),
    enabled: folderId !== null,
  });
}

export function useDeleteFolder(dataroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataroomStorage.deleteFolder(id),
    onSuccess: () => invalidateDataroom(queryClient, dataroomId),
  });
}

export function useRenameFile(dataroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      dataroomStorage.renameFile(id, name),
    onSuccess: () => invalidateDataroom(queryClient, dataroomId),
  });
}

export function useDeleteFile(dataroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataroomStorage.deleteFile(id),
    onSuccess: () => invalidateDataroom(queryClient, dataroomId),
  });
}

export function useUploadFile(dataroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ parentId, file }: { parentId: string | null; file: File }) =>
      dataroomStorage.uploadFile(dataroomId, parentId, file),
    onSuccess: () => invalidateDataroom(queryClient, dataroomId),
  });
}

export function useBulkDelete(dataroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: BrowserItem[]) =>
      Promise.all(
        items.map((item) =>
          item.kind === "folder"
            ? dataroomStorage.deleteFolder(item.id)
            : dataroomStorage.deleteFile(item.id),
        ),
      ),
    onSuccess: () => invalidateDataroom(queryClient, dataroomId),
  });
}

export function useFileBlob(fileId: string | null) {
  return useQuery({
    queryKey: ["file-blob", fileId],
    queryFn: () => dataroomStorage.getFileBlob(fileId as string),
    enabled: fileId !== null,
  });
}
