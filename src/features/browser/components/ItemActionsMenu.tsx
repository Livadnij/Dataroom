import {
  MoreVerticalIcon,
  PencilIcon,
  DownloadIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadFile } from "../lib/downloadFile";
import type { BrowserItem } from "@/types/entities";

interface ItemActionsMenuProps {
  item: BrowserItem;
  onRename: () => void;
  onDelete: () => void;
}

export function ItemActionsMenu({
  item,
  onRename,
  onDelete,
}: ItemActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${item.name}`}
        >
          <MoreVerticalIcon className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onRename}>
          <PencilIcon className="size-4" />
          Rename
        </DropdownMenuItem>
        {item.kind === "file" && (
          <DropdownMenuItem onSelect={() => downloadFile(item.id, item.name)}>
            <DownloadIcon className="size-4" />
            Download
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2Icon className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
