import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onCancel: () => void;
}

export function SelectionToolbar({
  selectedCount,
  totalCount,
  onDeleteSelected,
  onSelectAll,
  onCancel,
}: SelectionToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
      <span className="mr-1 text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      <Button
        variant="destructive"
        size="sm"
        disabled={selectedCount === 0}
        onClick={onDeleteSelected}
      >
        <Trash2Icon className="size-4" />
        Delete selected
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={totalCount === 0 || selectedCount === totalCount}
        onClick={onSelectAll}
      >
        Select all
      </Button>
      <Button variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
