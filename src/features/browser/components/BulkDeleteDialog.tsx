import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBulkDelete } from "../api/useBrowser";
import type { BrowserItem } from "@/types/entities";

interface BulkDeleteDialogProps {
  dataroomId: string;
  items: BrowserItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function BulkDeleteDialog({
  dataroomId,
  items,
  open,
  onOpenChange,
  onDeleted,
}: BulkDeleteDialogProps) {
  const bulkDelete = useBulkDelete(dataroomId);
  const folderCount = items.filter((item) => item.kind === "folder").length;

  function handleConfirm() {
    bulkDelete.mutate(items, {
      onSuccess: () => {
        onOpenChange(false);
        onDeleted();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete {items.length} item{items.length === 1 ? "" : "s"}?
          </DialogTitle>
          <DialogDescription>
            {folderCount > 0
              ? "This also deletes everything inside any selected folders. This can't be undone."
              : "This can't be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={bulkDelete.isPending}
            onClick={handleConfirm}
          >
            {bulkDelete.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
