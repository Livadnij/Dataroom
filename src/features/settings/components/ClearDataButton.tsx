import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resetLocalData } from "@/lib/storage/reset";
import { getErrorMessage } from "@/lib/errors";

export function ClearDataButton() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleConfirm() {
    setIsPending(true);
    try {
      await resetLocalData();
      queryClient.invalidateQueries({ queryKey: ["datarooms"] });
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      queryClient.invalidateQueries({ queryKey: ["breadcrumbs"] });
      setOpen(false);
      navigate("/");
      toast.success("Local data cleared.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2Icon className="size-3.5" />
        Clear local data
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all local data?</DialogTitle>
            <DialogDescription>
              This permanently deletes every dataroom, folder, and file stored
              in this browser. Your theme and view preferences are kept. This
              can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Clearing…" : "Clear data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
