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
import type { BrowserItem, FileNode } from "@/types/entities";

interface ItemTableProps {
  dataroomId: string;
  folderId: string | null;
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleItem: (id: string) => void;
}

export function ItemTable({
  dataroomId,
  folderId,
  selectMode,
  selectedIds,
  onToggleItem,
}: ItemTableProps) {
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
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 pr-4 pl-4 font-normal">Name</th>
            <th className="hidden w-24 py-2 pr-4 font-normal sm:table-cell">
              Size
            </th>
            <th className="hidden w-28 py-2 pr-4 font-normal md:table-cell">
              Modified
            </th>
            <th className="w-14 py-2 text-right font-normal">Actions</th>
          </tr>
        </thead>
        <tbody>
          {folders.map((folder) => (
            <tr
              key={folder.id}
              className="group border-b last:border-0 hover:bg-accent/50"
            >
              <td className="min-w-0 py-2 pr-4 pl-4">
                <div className="flex min-w-0 items-center gap-2">
                  {selectMode && (
                    <Checkbox
                      checked={selectedIds.has(folder.id)}
                      onCheckedChange={() => onToggleItem(folder.id)}
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`Select ${folder.name}`}
                    />
                  )}
                  <Link
                    to={`/dataroom/${dataroomId}/${folder.id}`}
                    onClick={(event) => {
                      if (selectMode) {
                        event.preventDefault();
                        onToggleItem(folder.id);
                      }
                    }}
                    className="flex min-w-0 items-center gap-2 font-medium"
                  >
                    <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate" title={folder.name}>
                      {folder.name}
                    </span>
                  </Link>
                </div>
              </td>
              <td className="hidden truncate py-2 pr-4 text-muted-foreground sm:table-cell">
                —
              </td>
              <td className="hidden truncate py-2 pr-4 text-muted-foreground md:table-cell">
                {new Date(folder.createdAt).toLocaleDateString()}
              </td>
              <td className="py-2">
                <div className="flex justify-end opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100">
                  <ItemActionsMenu
                    item={{ kind: "folder", ...folder }}
                    onRename={() =>
                      setRenameTarget({ kind: "folder", ...folder })
                    }
                    onDelete={() =>
                      setDeleteTarget({ kind: "folder", ...folder })
                    }
                  />
                </div>
              </td>
            </tr>
          ))}
          {files.map((file) => (
            <tr
              key={file.id}
              className="group border-b last:border-0 hover:bg-accent/50"
            >
              <td className="min-w-0 py-2 pr-4 pl-4">
                <div className="flex min-w-0 items-center gap-2">
                  {selectMode && (
                    <Checkbox
                      checked={selectedIds.has(file.id)}
                      onCheckedChange={() => onToggleItem(file.id)}
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`Select ${file.name}`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      selectMode
                        ? onToggleItem(file.id)
                        : setPreviewTarget(file)
                    }
                    className="flex min-w-0 w-full items-center gap-2 text-left hover:underline"
                  >
                    <span className="truncate" title={file.name}>
                      {file.name}
                    </span>
                  </button>
                </div>
              </td>
              <td className="hidden truncate py-2 pr-4 text-muted-foreground sm:table-cell">
                {formatBytes(file.size)}
              </td>
              <td className="hidden truncate py-2 pr-4 text-muted-foreground md:table-cell">
                {new Date(file.createdAt).toLocaleDateString()}
              </td>
              <td className="py-2">
                <div className="flex justify-end">
                  <ItemActionsMenu
                    item={{ kind: "file", ...file }}
                    onRename={() => setRenameTarget({ kind: "file", ...file })}
                    onDelete={() => setDeleteTarget({ kind: "file", ...file })}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
