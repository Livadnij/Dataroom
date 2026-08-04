import { useState } from "react";
import { FolderPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateDataroomDialog } from "./CreateDataroomDialog";

export function DataroomToolbar() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
        <FolderPlusIcon className="size-4" />
        New dataroom
      </Button>
      <CreateDataroomDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
