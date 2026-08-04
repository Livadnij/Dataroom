import { useRef, useState, type DragEvent } from "react";
import { XIcon } from "lucide-react";
import { BrowserToolbar } from "./BrowserToolbar";
import { SelectionToolbar } from "./SelectionToolbar";
import { BulkDeleteDialog } from "./BulkDeleteDialog";
import { ItemTable } from "./ItemTable";
import { ItemGrid } from "./ItemGrid";
import { useFolderContents, useUploadFile } from "../api/useBrowser";
import { isFileTooLarge, formatBytes } from "@/lib/validation/sizeCap";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { useSettings } from "@/lib/settings/useSettings";
import type { BrowserItem } from "@/types/entities";

interface FileBrowserProps {
  dataroomId: string;
  folderId: string | null;
}

export function FileBrowser({ dataroomId, folderId }: FileBrowserProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const uploadFile = useUploadFile(dataroomId);
  const [{ viewMode }] = useSettings();

  const { data: contents } = useFolderContents(dataroomId, folderId);
  const allItems: BrowserItem[] = [
    ...(contents?.folders ?? []).map((folder) => ({
      kind: "folder" as const,
      ...folder,
    })),
    ...(contents?.files ?? []).map((file) => ({
      kind: "file" as const,
      ...file,
    })),
  ];

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  function toggleSelectMode() {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  }

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(allItems.map((item) => item.id)));
  }

  function cancelSelection() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  const selectedItems = allItems.filter((item) => selectedIds.has(item.id));

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList);
    const tooLarge = files.filter((f) => isFileTooLarge(f.size));
    const okFiles = files.filter((f) => !isFileTooLarge(f.size));

    setUploadError(
      tooLarge.length > 0
        ? `Skipped ${tooLarge.length} file${tooLarge.length === 1 ? "" : "s"} over ${formatBytes(MAX_FILE_SIZE_BYTES)}: ${tooLarge.map((f) => f.name).join(", ")}`
        : null,
    );

    for (const file of okFiles) {
      await uploadFile.mutateAsync({ parentId: folderId, file });
    }
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current += 1;
    if (event.dataTransfer.types.includes("Files")) setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <BrowserToolbar
        dataroomId={dataroomId}
        folderId={folderId}
        onUpload={handleFiles}
        isUploading={uploadFile.isPending}
        selectMode={selectMode}
        onToggleSelectMode={toggleSelectMode}
      />

      {selectMode && (
        <SelectionToolbar
          selectedCount={selectedIds.size}
          totalCount={allItems.length}
          onDeleteSelected={() => setBulkDeleteOpen(true)}
          onSelectAll={selectAll}
          onCancel={cancelSelection}
        />
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="relative flex min-h-[70vh] flex-1 flex-col gap-4"
      >
        {uploadError && (
          <div className="flex items-start justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span>{uploadError}</span>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="shrink-0 text-destructive/70 hover:text-destructive"
              aria-label="Dismiss"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        )}

        {viewMode === "grid" ? (
          <ItemGrid
            dataroomId={dataroomId}
            folderId={folderId}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onToggleItem={toggleItem}
          />
        ) : (
          <ItemTable
            dataroomId={dataroomId}
            folderId={folderId}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onToggleItem={toggleItem}
          />
        )}

        {isDragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5">
            <p className="text-sm font-medium text-primary">
              Drop files to upload
            </p>
          </div>
        )}
      </div>

      <BulkDeleteDialog
        dataroomId={dataroomId}
        items={selectedItems}
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onDeleted={cancelSelection}
      />
    </div>
  );
}
