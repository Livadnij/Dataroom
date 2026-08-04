import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteDataroom } from "../api/useDatarooms";
import type { Dataroom } from "@/types/entities";

interface DeleteDataroomDialogProps {
  dataroom: Dataroom | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDataroomDialog({
  dataroom,
  onOpenChange,
}: DeleteDataroomDialogProps) {
  const deleteDataroom = useDeleteDataroom();

  return (
    <Dialog open={dataroom !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="break-all">
          <DialogTitle>Delete "{dataroom?.name}"?</DialogTitle>
          <DialogDescription>
            This permanently deletes the dataroom and everything inside it — all
            folders and files. This can't be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={deleteDataroom.isPending}
            onClick={() => {
              if (!dataroom) return;
              deleteDataroom.mutate(dataroom.id, {
                onSuccess: () => onOpenChange(false),
              });
            }}
          >
            {deleteDataroom.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
