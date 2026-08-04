import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useDeleteFolder,
  useDeleteFile,
  useFolderDeletionPreview,
} from "../api/useBrowser";
import type { BrowserItem } from "@/types/entities";

interface DeleteItemDialogProps {
  dataroomId: string;
  item: BrowserItem | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteItemDialog({
  dataroomId,
  item,
  onOpenChange,
}: DeleteItemDialogProps) {
  const isFolder = item?.kind === "folder";
  const preview = useFolderDeletionPreview(isFolder ? item.id : null);
  const deleteFolder = useDeleteFolder(dataroomId);
  const deleteFile = useDeleteFile(dataroomId);

  function handleConfirm() {
    if (!item) return;
    if (item.kind === "folder") {
      deleteFolder.mutate(item.id, { onSuccess: () => onOpenChange(false) });
    } else {
      deleteFile.mutate(item.id, { onSuccess: () => onOpenChange(false) });
    }
  }

  const isPending = deleteFolder.isPending || deleteFile.isPending;
  const confirmDisabled = isPending || (isFolder && preview.isLoading);

  function describeFolderImpact() {
    if (!preview.data) return "Checking contents…";
    const nestedFolders = preview.data.folders - 1;
    const { files } = preview.data;
    if (nestedFolders === 0 && files === 0)
      return "This folder is empty. This can't be undone.";
    return `Deletes this folder, ${nestedFolders} nested folder${nestedFolders === 1 ? "" : "s"}, and ${files} file${files === 1 ? "" : "s"}. This can't be undone.`;
  }

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete "{item?.name}"?</DialogTitle>
          <DialogDescription>
            {item?.kind === "folder"
              ? describeFolderImpact()
              : "This permanently deletes the file. This can't be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmDisabled}
            onClick={handleConfirm}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
