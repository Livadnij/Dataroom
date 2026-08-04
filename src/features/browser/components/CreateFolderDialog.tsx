import { CreateNameDialog } from "@/components/CreateNameDialog";
import { useCreateFolder } from "../api/useBrowser";

interface CreateFolderDialogProps {
  dataroomId: string;
  folderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFolderDialog({
  dataroomId,
  folderId,
  open,
  onOpenChange,
}: CreateFolderDialogProps) {
  const createFolder = useCreateFolder(dataroomId);

  return (
    <CreateNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New folder"
      label="Folder name"
      placeholder="Folder name"
      isPending={createFolder.isPending}
      onCreate={(name) =>
        createFolder.mutate(
          { parentId: folderId, name },
          { onSuccess: () => onOpenChange(false) },
        )
      }
    />
  );
}
