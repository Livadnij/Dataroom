import { useRef, useState } from "react";
import { CheckSquareIcon, FolderPlusIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateFolderDialog } from "./CreateFolderDialog";

interface BrowserToolbarProps {
  dataroomId: string;
  folderId: string | null;
  onUpload: (files: FileList) => void;
  isUploading: boolean;
  selectMode: boolean;
  onToggleSelectMode: () => void;
}

export function BrowserToolbar({
  dataroomId,
  folderId,
  onUpload,
  isUploading,
  selectMode,
  onToggleSelectMode,
}: BrowserToolbarProps) {
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCreateFolderOpen(true)}
      >
        <FolderPlusIcon className="size-4" />
        New folder
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <UploadIcon className="size-4" />
        {isUploading ? "Uploading…" : "Upload"}
      </Button>
      <Button
        variant={selectMode ? "secondary" : "outline"}
        size="sm"
        onClick={onToggleSelectMode}
      >
        <CheckSquareIcon className="size-4" />
        Select
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            onUpload(event.target.files);
          }
          event.target.value = "";
        }}
      />
      <CreateFolderDialog
        dataroomId={dataroomId}
        folderId={folderId}
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />
    </div>
  );
}
