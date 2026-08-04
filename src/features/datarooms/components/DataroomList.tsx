import { useState } from "react";
import { useDatarooms } from "../api/useDatarooms";
import { DataroomCard } from "./DataroomCard";
import { DeleteDataroomDialog } from "./DeleteDataroomDialog";
import type { Dataroom } from "@/types/entities";

export function DataroomList() {
  const { data: datarooms, isLoading } = useDatarooms();
  const [pendingDelete, setPendingDelete] = useState<Dataroom | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading datarooms…</p>;
  }

  if (!datarooms || datarooms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No datarooms yet. Create one above to get started.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {datarooms.map((dataroom) => (
          <DataroomCard
            key={dataroom.id}
            dataroom={dataroom}
            onDeleteRequest={setPendingDelete}
          />
        ))}
      </div>
      <DeleteDataroomDialog
        dataroom={pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      />
    </>
  );
}
