import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderIcon } from "lucide-react";
import { useFolderContents } from "../api/useBrowser";
import { RenameItemDialog } from "./RenameItemDialog";
import { DeleteItemDialog } from "./DeleteItemDialog";
import { FilePreviewDialog } from "./FilePreviewDialog";
import { ItemActionsMenu } from "./ItemActionsMenu";
import { Checkbox } from "@/components/ui/checkbox";
import { formatBytes } from "@/lib/validation/sizeCap";
import { getFileIcon } from "../lib/fileIcon";
import type { BrowserItem, FileNode } from "@/types/entities";

interface ItemGridProps {
  dataroomId: string;
  folderId: string | null;
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleItem: (id: string) => void;
}

export function ItemGrid({
  dataroomId,
  folderId,
  selectMode,
  selectedIds,
  onToggleItem,
}: ItemGridProps) {
  const { data, isLoading } = useFolderContents(dataroomId, folderId);
  const [renameTarget, setRenameTarget] = useState<BrowserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrowserItem | null>(null);
  const [previewTarget, setPreviewTarget] = useState<FileNode | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const folders = data?.folders ?? [];
  const files = data?.files ?? [];

  if (folders.length === 0 && files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {folderId === null
          ? "This dataroom is empty."
          : "This folder is empty."}
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="group relative flex flex-col items-center gap-2 rounded-lg border p-3 hover:bg-accent/50"
          >
            {selectMode && (
              <div className="absolute left-1 top-1 z-10">
                <Checkbox
                  checked={selectedIds.has(folder.id)}
                  onCheckedChange={() => onToggleItem(folder.id)}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Select ${folder.name}`}
                />
              </div>
            )}
            <div className="absolute right-1 top-1">
              <ItemActionsMenu
                item={{ kind: "folder", ...folder }}
                onRename={() => setRenameTarget({ kind: "folder", ...folder })}
                onDelete={() => setDeleteTarget({ kind: "folder", ...folder })}
              />
            </div>
            <Link
              to={`/dataroom/${dataroomId}/${folder.id}`}
              onClick={(event) => {
                if (selectMode) {
                  event.preventDefault();
                  onToggleItem(folder.id);
                }
              }}
              className="flex w-full flex-col items-center gap-2"
            >
              <FolderIcon className="size-10 shrink-0 text-muted-foreground" />
              <span
                className="w-full truncate text-center text-sm font-medium"
                title={folder.name}
              >
                {folder.name}
              </span>
            </Link>
          </div>
        ))}
        {files.map((file) => {
          const FileIconComponent = getFileIcon(file.mimeType);
          return (
            <div
              key={file.id}
              className="group relative flex flex-col items-center gap-2 rounded-lg border p-3 hover:bg-accent/50"
            >
              {selectMode && (
                <div className="absolute left-1 top-1 z-10">
                  <Checkbox
                    checked={selectedIds.has(file.id)}
                    onCheckedChange={() => onToggleItem(file.id)}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Select ${file.name}`}
                  />
                </div>
              )}
              <div className="absolute right-1 top-1">
                <ItemActionsMenu
                  item={{ kind: "file", ...file }}
                  onRename={() => setRenameTarget({ kind: "file", ...file })}
                  onDelete={() => setDeleteTarget({ kind: "file", ...file })}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  selectMode ? onToggleItem(file.id) : setPreviewTarget(file)
                }
                className="flex w-full flex-col items-center gap-2 text-center"
              >
                <FileIconComponent className="size-10 shrink-0 text-muted-foreground" />
                <span
                  className="w-full truncate text-sm font-medium"
                  title={file.name}
                >
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <RenameItemDialog
        dataroomId={dataroomId}
        item={renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
      />
      <DeleteItemDialog
        dataroomId={dataroomId}
        item={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
      <FilePreviewDialog
        file={previewTarget}
        onOpenChange={(open) => !open && setPreviewTarget(null)}
      />
    </>
  );
}
