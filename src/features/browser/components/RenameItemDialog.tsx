import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRenameFolder, useRenameFile } from "../api/useBrowser";
import type { BrowserItem } from "@/types/entities";

interface RenameItemDialogProps {
  dataroomId: string;
  item: BrowserItem | null;
  onOpenChange: (open: boolean) => void;
}

export function RenameItemDialog({
  dataroomId,
  item,
  onOpenChange,
}: RenameItemDialogProps) {
  const [name, setName] = useState("");
  const renameFolder = useRenameFolder(dataroomId);
  const renameFile = useRenameFile(dataroomId);

  useEffect(() => {
    if (item) setName(item.name);
  }, [item]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !item) return;
    const mutation = item.kind === "folder" ? renameFolder : renameFile;
    mutation.mutate(
      { id: item.id, name: trimmed },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  const isPending = renameFolder.isPending || renameFile.isPending;

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Rename {item?.kind}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Name"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
